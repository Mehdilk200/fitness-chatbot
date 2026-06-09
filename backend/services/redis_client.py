import os
import json
import logging
from typing import Optional, Any

logger = logging.getLogger("redis")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

_redis = None
_available = False


async def get_redis():
    global _redis, _available
    if _redis is None and REDIS_URL:
        try:
            import redis.asyncio as aioredis
            _redis = aioredis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=False,
            )
            await _redis.ping()
            _available = True
            logger.info("Redis connected: %s", REDIS_URL)
        except Exception as e:
            _redis = None
            _available = False
            logger.warning("Redis unavailable — falling back to DB: %s", e)
    return _redis


async def close_redis():
    global _redis, _available
    if _redis:
        await _redis.close()
        _redis = None
        _available = False


async def redis_available() -> bool:
    return _available


async def cache_get(key: str) -> Optional[Any]:
    if not _available:
        return None
    try:
        r = await get_redis()
        if r is None:
            return None
        val = await r.get(key)
        return json.loads(val) if val else None
    except Exception as e:
        logger.warning("Redis get failed for %s: %s", key, e)
        return None


async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> bool:
    if not _available:
        return False
    try:
        r = await get_redis()
        if r is None:
            return False
        await r.setex(key, ttl_seconds, json.dumps(value, default=str))
        return True
    except Exception as e:
        logger.warning("Redis set failed for %s: %s", key, e)
        return False


async def cache_delete(key: str) -> bool:
    if not _available:
        return False
    try:
        r = await get_redis()
        if r is None:
            return False
        await r.delete(key)
        return True
    except Exception as e:
        logger.warning("Redis delete failed for %s: %s", key, e)
        return False


async def cache_delete_pattern(pattern: str) -> bool:
    if not _available:
        return False
    try:
        r = await get_redis()
        if r is None:
            return False
        cursor = 0
        while True:
            cursor, keys = await r.scan(cursor=cursor, match=pattern, count=100)
            if keys:
                await r.delete(*keys)
            if cursor == 0:
                break
        return True
    except Exception as e:
        logger.warning("Redis delete pattern failed for %s: %s", pattern, e)
        return False
