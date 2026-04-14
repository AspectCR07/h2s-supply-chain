from fastapi import APIRouter, HTTPException
from services.port_scraper import scrape_border_wait_times

router = APIRouter(prefix="/api/infrastructure", tags=["Infrastructure"])

@router.get("/wait-times")
def get_congestion_wait_times():
    """
    Scrape public border and port wait times to determine infrastructure congestion levels.
    """
    result = scrape_border_wait_times()
    if "error" in result:
        # Even if the scrape fails, we might want to return the fallback for the demo
        return {"status": "fallback", "data": result["fallback"]}
    return result
