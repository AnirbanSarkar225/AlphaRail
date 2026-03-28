# weather.py
import os
import logging
import requests

logger = logging.getLogger(__name__)

OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY", "")

# FIX: warn at startup if key is missing so it's not silently ignored
if not OPENWEATHER_KEY:
    logger.warning(
        "OPENWEATHER_KEY is not set. Weather endpoint will return impact=0. "
        "Set it with: set OPENWEATHER_KEY=your_key_here"
    )
STATION_COORDS = {
    # Using lowercase keys for easier matching from a URL
    "howrah": (22.5958, 88.2636),
    "new delhi": (28.6139, 77.2090),
}

# RENAMED function and parameter to match main.py
def get_weather(city: str):
    # Use city.lower() to match the keys in STATION_COORDS
    normalized_city = city.lower().replace("_", " ")

    if normalized_city not in STATION_COORDS:
        return {"impact": 0, "weather": "unknown_station"}

    if not OPENWEATHER_KEY:
        return {"impact": 0, "weather": "api_key_not_configured"}

    lat, lon = STATION_COORDS[normalized_city]
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_KEY}&units=metric"
    
    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        d = r.json()
        main = d.get("weather", [{}])[0].get("main", "").lower()
        impact = 0
        if "rain" in main:
            impact = 10
        elif "fog" in main or "mist" in main:
            impact = 7
        elif "storm" in main:
            impact = 15
        return {"impact": impact, "weather": main}
    except Exception as exc:
        logger.error("Weather fetch failed for %s: %s", city, exc)
        return {"impact": 0, "weather": "fetch_error"}