import os
import requests
from dotenv import load_dotenv

load_dotenv()

WEATHER_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
NEWS_API_KEY = os.getenv("NEWSAPI_KEY")

def fetch_weather_for_location(lat: float, lon: float):
    """
    Fetches the current weather and 5-day forecast for a given lat/lon.
    """
    weather_key = WEATHER_API_KEY or "e6a3f74ffa17309c8a3f10edd8524e6a"
    if not weather_key or weather_key == "INSERT_YOUR_OPENWEATHERMAP_KEY_HERE":
        return {"error": "Missing OpenWeatherMap API Key"}
        
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_key}&units=metric"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return {
            "status": "success",
            "temperature": data.get("main", {}).get("temp"),
            "condition": data.get("weather", [{}])[0].get("main"),
            "description": data.get("weather", [{}])[0].get("description"),
            "wind_speed": data.get("wind", {}).get("speed")
        }
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def fetch_logistics_news():
    """
    Queries NewsAPI for recent events related to port strikes, maritime disasters, or shipping delays.
    """
    news_key = NEWS_API_KEY or "af1ffc14a9ff45d78e58cfc6b0b699d2"
    if not news_key or news_key == "INSERT_YOUR_NEWSAPI_KEY_HERE":
        return {"error": "Missing NewsAPI Key"}
        
    query = "port strike OR maritime delay OR shipping congestion OR supply chain disruption"
    url = f"https://newsapi.org/v2/everything?q={query}&sortBy=publishedAt&language=en&apiKey={news_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        articles = response.json().get("articles", [])
        
        relevant_news = [
            {
                "title": art.get("title"),
                "source": art.get("source", {}).get("name"),
                "published_at": art.get("publishedAt"),
                "url": art.get("url")
            }
            for art in articles[:5]
        ]
        return {"status": "success", "news": relevant_news}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
