"""Cache-Aside helpers with configurable TTL and graceful fallback.

TTL Strategy:
  - Dashboard stats:      300s (5 min) — stale data is acceptable; user can sync manually
  - Activity logs list:   120s (2 min) — updates arrive via webhooks, short TTL
  - Provider tokens:      set to remaining token lifetime — never stale
  - Webhook dedup keys:  600s (10 min) — prevents double-processing

Cache-Aside pattern:
  1. Call cache_get(key)
  2. If hit → return cached
  3. If miss → fetch from DB, call cache_set(key, data, ttl)
  4. On write/update → call cache_delete or cache_delete_pattern to invalidate
"""

from typing import Optional, Callable, Awaitable, TypeVar
from services.redis_client import cache_get, cache_set, cache_delete

T = TypeVar("T")


async def cache_aside(
    key: str,
    fetch_func: Callable[[], Awaitable[T]],
    ttl_seconds: int = 300,
) -> T:
    cached = await cache_get(key)
    if cached is not None:
        return cached

    data = await fetch_func()
    if data is not None:
        await cache_set(key, data, ttl_seconds)
    return data


async def invalidate_user_stats(user_id: str):
    await cache_delete(f"user:{user_id}:stats")


async def invalidate_user_provider(user_id: str, provider: str):
    await cache_delete(f"user:{user_id}:tokens:{provider}")
