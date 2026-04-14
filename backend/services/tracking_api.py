import random
from datetime import datetime, timedelta

def fetch_tracking_info(tracking_code: str, carrier: str):
    """
    Simulates a live tracking API.
    Since enterprise tracking APIs require credit cards or complex approvals,
    this simulator generates highly realistic API payloads for hackathons.
    It deterministically generates status based on the tracking code length/hash.
    """
    
    # Generate deterministic but random-looking data based on the string
    seed = sum([ord(c) for c in tracking_code])
    random.seed(seed)
    
    statuses = ["in_transit", "out_for_delivery", "delivered", "exception_delayed"]
    locations = ["Sorting Facility, Los Angeles, CA", "Customs, Port of Long Beach", "In Transit (Maritime)", "Regional Hub, Chicago, IL", "Origin Facility, Shenzhen, CN"]
    
    current_status = random.choice(statuses)
    current_location = random.choice(locations)
    
    # Simulate an ETA 1-4 days from now
    eta_days = random.randint(1, 4)
    est_delivery = datetime.now() + timedelta(days=eta_days)
    
    # Let's force an exception/delay state if the tracking code ends in a '9' or 'X'
    if tracking_code.endswith('9') or tracking_code.endswith('X'):
        current_status = "exception_delayed"
        current_location = "Customs Hold, Port of LA"
        est_delivery = datetime.now() + timedelta(days=7)
        
    return {
        "status": "success",
        "shipment_id": f"shp_{random.randint(10000, 99999)}",
        "tracking_code": tracking_code,
        "carrier": carrier.upper(),
        "delivery_status": current_status,
        "est_delivery_date": est_delivery.isoformat(),
        "location": current_location,
        "history": [
            {
                "timestamp": (datetime.now() - timedelta(days=2)).isoformat(),
                "status": "label_created",
                "location": "Origin"
            },
            {
                "timestamp": (datetime.now() - timedelta(hours=14)).isoformat(),
                "status": "in_transit",
                "location": "Intermediate Hub"
            }
        ]
    }
