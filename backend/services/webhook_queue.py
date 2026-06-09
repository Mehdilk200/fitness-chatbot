"""Lightweight webhook queue using Redis lists.

Uses BRPOPLPUSH pattern for reliable delivery:
  - RPUSH payload to 'webhook:pending' list
  - BRPOPLPUSH from 'webhook:pending' to 'webhook:processing' (atomic)
  - Process the payload
  - LREM from 'webhook:processing' on success

Fallback: when Redis is down, webhooks are processed inline (no queuing).
"""

import json
import asyncio
import logging
from typing import Optional

logger = logging.getLogger("webhook_queue")

QUEUE_KEY = "webhook:pending"
PROCESSING_KEY = "webhook:processing"
WEBHOOK_TTL = 600


async def enqueue_webhook(payload: dict) -> bool:
    from services.redis_client import get_redis, redis_available
    if not await redis_available():
        logger.info("Redis unavailable — processing webhook inline")
        return False

    r = await get_redis()
    if r is None:
        return False

    try:
        data = json.dumps(payload, default=str)
        await r.rpush(QUEUE_KEY, data)
        await r.expire(QUEUE_KEY, WEBHOOK_TTL)
        return True
    except Exception as e:
        logger.warning("Failed to enqueue webhook: %s", e)
        return False


async def dequeue_webhook() -> Optional[dict]:
    from services.redis_client import get_redis, redis_available
    if not await redis_available():
        return None

    r = await get_redis()
    if r is None:
        return None

    try:
        result = await r.brpoplpush(QUEUE_KEY, PROCESSING_KEY, timeout=5)
        if result:
            await r.expire(PROCESSING_KEY, WEBHOOK_TTL)
            return json.loads(result)
    except Exception as e:
        logger.warning("Failed to dequeue webhook: %s", e)
    return None


async def mark_processed(payload: dict) -> bool:
    from services.redis_client import get_redis, redis_available
    if not await redis_available():
        return False

    r = await get_redis()
    if r is None:
        return False

    try:
        data = json.dumps(payload, default=str)
        await r.lrem(PROCESSING_KEY, 1, data)
        return True
    except Exception as e:
        logger.warning("Failed to mark webhook processed: %s", e)
        return False


async def webhook_worker_loop(process_callback):
    """Background task: continuously dequeue and process webhooks."""
    logger.info("Webhook worker started")
    while True:
        try:
            payload = await dequeue_webhook()
            if payload:
                logger.info("Processing queued webhook: type=%s", payload.get("type"))
                try:
                    await process_callback(payload)
                except Exception as e:
                    logger.error("Webhook processing failed: %s", e)
                finally:
                    await mark_processed(payload)
            else:
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            logger.info("Webhook worker cancelled")
            break
        except Exception as e:
            logger.warning("Webhook worker error: %s", e)
            await asyncio.sleep(5)
