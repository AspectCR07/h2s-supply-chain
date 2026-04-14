from fastapi import APIRouter, HTTPException
from services.external_apis import fetch_logistics_news

router = APIRouter(prefix="/api/news", tags=["Disruptions"])

@router.get("/")
def get_logistics_news():
    """
    Get the latest top 5 logistics disruption news headlines using NewsAPI.
    """
    result = fetch_logistics_news()
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
