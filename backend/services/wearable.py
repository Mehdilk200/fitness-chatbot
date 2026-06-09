import logging
from datetime import datetime, timedelta
from typing import Optional

from services.strava import strava_oauth, normalize_strava_activity
from services.fitbit import fitbit_oauth, normalize_fitbit_activity

logger = logging.getLogger("wearable")

PROVIDER_MAP = {
    "strava": strava_oauth,
    "fitbit": fitbit_oauth,
}

NORMALIZE_MAP = {
    "strava": normalize_strava_activity,
    "fitbit": normalize_fitbit_activity,
}


def get_provider(provider: str):
    return PROVIDER_MAP.get(provider)


def normalize_activity(provider: str, raw: dict) -> Optional[dict]:
    fn = NORMALIZE_MAP.get(provider)
    if not fn:
        logger.warning("No normalizer for provider: %s", provider)
        return None
    try:
        return fn(raw)
    except Exception as e:
        logger.error("Normalization failed for %s: %s", provider, e)
        return None


def compute_totals_from_logs(logs: list) -> dict:
    total_distance = 0.0
    total_steps = 0
    total_calories = 0
    total_minutes = 0
    total_elevation = 0.0
    hr_readings_avg = []
    hr_readings_peak = []
    by_type = {}

    for log in logs:
        total_distance += log.get("distance_km", 0) or 0
        total_steps += log.get("steps", 0) or 0
        total_calories += log.get("calories", 0) or 0
        total_minutes += log.get("duration_minutes", 0) or 0
        total_elevation += log.get("elevation_gain", 0) or 0
        if log.get("heart_rate_avg"):
            hr_readings_avg.append(log["heart_rate_avg"])
        if log.get("heart_rate_peak"):
            hr_readings_peak.append(log["heart_rate_peak"])

        t = log.get("type", "other")
        by_type[t] = by_type.get(t, 0) + 1

    avg_hr = round(sum(hr_readings_avg) / len(hr_readings_avg)) if hr_readings_avg else 0
    peak_hr = max(hr_readings_peak) if hr_readings_peak else 0

    return {
        "total_distance_km": round(total_distance, 1),
        "total_steps": total_steps,
        "total_calories": total_calories,
        "total_minutes": total_minutes,
        "total_elevation_gain": round(total_elevation, 1),
        "heart_rate_avg": avg_hr,
        "heart_rate_peak": peak_hr,
        "activity_breakdown": by_type,
    }
