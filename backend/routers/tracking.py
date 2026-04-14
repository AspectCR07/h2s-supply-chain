from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
from services.tracking_api import fetch_tracking_info

router = APIRouter(prefix="/api/tracking", tags=["Tracking"])

class RouteOptimizationRequest(BaseModel):
    origin: str
    destination: str
    current_route_id: str

@router.get("/{carrier}/{tracking_code}")
def get_live_tracking(carrier: str, tracking_code: str):
    """
    Hit the EasyPost / Simulator API to get live transit status.
    Carrier Examples: 'USPS', 'FedEx', 'UPS'
    """
    result = fetch_tracking_info(tracking_code, carrier)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/route-optimizer")
def optimize_maritime_route(req: RouteOptimizationRequest):
    """
    Dynamically generates ESG and Cost comparisons for route diversions.
    """
    random.seed()
    
    # Base Current Route Constraints
    base_eta_days = random.randint(14, 21)
    base_cost = random.randint(45000, 80000)
    base_carbon = random.randint(200, 400) # Tons
    
    # Optimized Diversion (Better time, maybe higher cost or carbon)
    # The hackathon algorithm simulates finding a route that is faster but varies in ESG
    opt_eta_days = base_eta_days - random.randint(2, 5)
    opt_cost = base_cost + random.randint(-5000, 15000)
    opt_carbon = base_carbon + random.randint(-40, 20)
    
    return {
        "origin": req.origin,
        "destination": req.destination,
        "current_route": {
            "name": "Original (via heavily congested zone)",
            "eta_days": base_eta_days,
            "fuel_cost": base_cost,
            "carbon_emissions_tons": base_carbon
        },
        "optimized_route": {
            "name": "Diversion AI Path",
            "eta_days": opt_eta_days,
            "fuel_cost": opt_cost,
            "carbon_emissions_tons": opt_carbon
        },
        "deltas": {
            "time_saved_days": base_eta_days - opt_eta_days,
            "cost_difference": opt_cost - base_cost,
            "carbon_difference": opt_carbon - base_carbon
        }
    }
