from fastapi import APIRouter, HTTPException
from services.external_apis import fetch_weather_for_location

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/")
def get_weather(lat: float, lon: float):
    """
    Get live weather for specific coordinates using OpenWeatherMap.
    Example: /api/weather/?lat=33.7294&lon=-118.2620 (Port of LA)
    """
    result = fetch_weather_for_location(lat, lon)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
