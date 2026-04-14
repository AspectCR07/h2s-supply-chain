from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routers import weather, news, predictions, tracking, infrastructure

app = FastAPI(
    title="AI Supply Chain Backend",
    description="Live backend integrating external APIs and ML models",
    version="1.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(weather.router)
app.include_router(news.router)
app.include_router(predictions.router)
app.include_router(tracking.router)
app.include_router(infrastructure.router)

@app.get("/")
def read_root():
    return {"message": "AI Supply Chain API is running. Go to /docs for Swagger UI."}
