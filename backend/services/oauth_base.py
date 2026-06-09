import os
import time
import json
import logging
from abc import ABC, abstractmethod
from typing import Optional
import httpx

logger = logging.getLogger("oauth_base")


class OAuth2Provider(ABC):
    """Abstract base for provider OAuth2 flows."""

    client_id: str = ""
    client_secret: str = ""
    redirect_uri: str = ""
    auth_url: str = ""
    token_url: str = ""
    api_base: str = ""
    scopes: str = ""

    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        ...

    @abstractmethod
    async def exchange_code(self, code: str) -> Optional[dict]:
        ...

    @abstractmethod
    async def refresh_access_token(self, refresh_token: str) -> Optional[dict]:
        ...

    @abstractmethod
    async def fetch_user_id(self, access_token: str) -> Optional[str]:
        ...

    async def _post(self, url: str, data: dict, headers: Optional[dict] = None) -> Optional[dict]:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(url, data=data, headers=headers)
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error("POST %s failed: %s", url, e)
            return None

    async def _get(self, url: str, headers: Optional[dict] = None) -> Optional[dict]:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error("GET %s failed: %s", url, e)
            return None


def is_token_expired(expires_at: Optional[int]) -> bool:
    if not expires_at:
        return True
    return time.time() >= expires_at - 60
