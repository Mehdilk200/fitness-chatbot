import os
import base64
import logging
from typing import Optional
from services.oauth_base import OAuth2Provider, is_token_expired

logger = logging.getLogger("fitbit")

FITBIT_CLIENT_ID = os.getenv("FITBIT_CLIENT_ID", "")
FITBIT_CLIENT_SECRET = os.getenv("FITBIT_CLIENT_SECRET", "")
FITBIT_REDIRECT_URI = os.getenv("FITBIT_REDIRECT_URI", "http://localhost:8001/api/wearable/callback/fitbit")

AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
TOKEN_URL = "https://api.fitbit.com/oauth2/token"
API_BASE = "https://api.fitbit.com/1/user/-"
SCOPE = "activity heartrate profile weight"


class FitbitOAuth(OAuth2Provider):
    client_id = FITBIT_CLIENT_ID
    client_secret = FITBIT_CLIENT_SECRET
    redirect_uri = FITBIT_REDIRECT_URI
    auth_url = AUTH_URL
    token_url = TOKEN_URL
    api_base = API_BASE
    scopes = SCOPE

    def _basic_auth(self) -> str:
        raw = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(raw.encode()).decode()

    def get_authorization_url(self, state: str) -> str:
        params = (
            f"client_id={self.client_id}"
            f"&redirect_uri={self.redirect_uri}"
            f"&response_type=code"
            f"&scope={self.scopes}"
            f"&state={state}"
        )
        return f"{self.auth_url}?{params}"

    async def exchange_code(self, code: str) -> Optional[dict]:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
        }
        headers = {
            "Authorization": f"Basic {self._basic_auth()}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        result = await self._post(self.token_url, data, headers)
        if result:
            return {
                "access_token": result.get("access_token"),
                "refresh_token": result.get("refresh_token"),
                "expires_at": int(result.get("expires_in", 28800)) + int(__import__("time").time()),
                "provider_user_id": result.get("user_id", ""),
            }
        return None

    async def refresh_access_token(self, refresh_token: str) -> Optional[dict]:
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        headers = {
            "Authorization": f"Basic {self._basic_auth()}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        result = await self._post(self.token_url, data, headers)
        if result:
            return {
                "access_token": result.get("access_token"),
                "refresh_token": result.get("refresh_token"),
                "expires_at": int(result.get("expires_in", 28800)) + int(__import__("time").time()),
                "provider_user_id": result.get("user_id", ""),
            }
        return None

    async def fetch_user_id(self, access_token: str) -> Optional[str]:
        headers = {"Authorization": f"Bearer {access_token}"}
        data = await self._get(f"{self.api_base}/profile.json", headers=headers)
        if data and "user" in data:
            return data["user"].get("encodedId", "")
        return None

    async def fetch_activities(self, access_token: str, after_date: str = "") -> list:
        headers = {"Authorization": f"Bearer {access_token}"}
        import datetime
        today = datetime.date.today().isoformat()
        if not after_date:
            after_date = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
        url = f"{self.api_base}/activities/list.json?beforeDate={today}&offset=0&limit=50&sort=desc"
        data = await self._get(url, headers=headers)
        if data and "activities" in data:
            return data["activities"]
        return []

    async def fetch_activity_detail(self, access_token: str, log_id: int) -> Optional[dict]:
        headers = {"Authorization": f"Bearer {access_token}"}
        return await self._get(f"{self.api_base}/activities/{log_id}.json", headers=headers)


def normalize_fitbit_activity(raw: dict) -> dict:
    activity_name = raw.get("activityName", "")
    activity_type = raw.get("activityTypeId", "")
    custom = raw.get("customActivityType", {})

    mapped_type = "other"
    name_lower = activity_name.lower()
    if "run" in name_lower or "jog" in name_lower:
        mapped_type = "run"
    elif "walk" in name_lower or "hike" in name_lower:
        mapped_type = "walk"
    elif "ride" in name_lower or "bike" in name_lower or "cycle" in name_lower:
        mapped_type = "ride"
    elif "swim" in name_lower:
        mapped_type = "swim"
    elif "weight" in name_lower or "strength" in name_lower or "workout" in name_lower:
        mapped_type = "workout"

    distance_m = 0
    distances = raw.get("distance", [])
    if isinstance(distances, list):
        for d in distances:
            if d.get("unit") == "Kilometer":
                distance_m = float(d.get("value", 0)) * 1000
                break
            elif d.get("unit") == "Meter":
                distance_m = float(d.get("value", 0))
                break
    elif isinstance(distances, (int, float)):
        distance_m = float(distances) * 1000
    elif isinstance(distances, dict):
        distance_m = float(distances.get("value", 0)) * 1000

    duration_m = raw.get("duration", 0) or 0
    duration_min = round(duration_m / 60000)
    calories = raw.get("calories", 0) or 0
    steps = raw.get("steps", 0) or 0

    start_date = raw.get("startDate", "") or raw.get("startTime", "") or ""

    return {
        "provider": "fitbit",
        "provider_activity_id": str(raw.get("logId", "")),
        "date": start_date[:10] if start_date else "",
        "type": mapped_type,
        "name": activity_name,
        "steps": steps,
        "calories": round(calories),
        "distance_km": round(distance_m / 1000, 2),
        "duration_minutes": duration_min,
        "heart_rate_avg": 0,
        "heart_rate_peak": 0,
        "elevation_gain": 0.0,
        "raw_data": {
            "fitbit_log_id": raw.get("logId"),
            "activity_type_id": activity_type,
            "start_date": start_date,
        },
    }


fitbit_oauth = FitbitOAuth()
