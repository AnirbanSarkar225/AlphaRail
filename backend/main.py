
import copy
import random
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database
import models  # ensures all DB tables are created on startup
import planner
import emergency
import disaster
import weather
from railapi import get_train_schedule

ROUTE_MAX_KM = {
    "Howrah - New Delhi": 1450,
    "Patna - New Delhi": 1000,
}

class QueryRequest(BaseModel):
    train_no: str
    subject: str
    message: str

class EmergencyRequest(BaseModel):
    description: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.init_db()
    yield

app = FastAPI(title="AlphaRail Backend API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_submitted_emergencies = []

_mock_train_data = [
    {"train_no": "12301", "name": "Rajdhani Express", "route": "Howrah - New Delhi", "position_km": 120, "departure_time": "04:50 PM", "arrival_time": "10:05 AM"},
    {"train_no": "12302", "name": "Duronto Express", "route": "Howrah - New Delhi", "position_km": 250, "departure_time": "10:15 AM", "arrival_time": "11:45 PM"},
    {"train_no": "12303", "name": "Shatabdi Express", "route": "Howrah - New Delhi", "position_km": 400, "departure_time": "02:00 PM", "arrival_time": "01:00 AM"},
    {"train_no": "12401", "name": "Magadh Express", "route": "Patna - New Delhi", "position_km": 100, "departure_time": "09:30 AM", "arrival_time": "11:00 PM"},
    {"train_no": "12402", "name": "Vaishali Express", "route": "Patna - New Delhi", "position_km": 300, "departure_time": "11:00 AM", "arrival_time": "01:30 AM"},
]
@app.get("/")
async def home():
    return {"message": "AlphaRail backend running 🚆"}
@app.get("/api/train/{train_no}")
async def get_train_details(train_no: str):
    train = next((t for t in _mock_train_data if t["train_no"] == train_no), None)
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    return train

@app.get("/api/trains_between")
async def find_trains_between_stations(from_station: str, to_station: str):
    route_string = f"{from_station} - {to_station}"
    # FIX: build fresh dicts instead of mutating shared _mock_train_data objects
    matching_trains = [
        {**t, "departure": f"{9 + i * 2}:00 AM", "arrival": f"{1 + i * 3}:15 PM"}
        for i, t in enumerate(
            t for t in _mock_train_data if t["route"].lower() == route_string.lower()
        )
    ]
    return matching_trains
@app.get("/api/schedule/{train_no}")
async def api_schedule(train_no: str):
    try:
        data, error = get_train_schedule(train_no)
        if error:
            raise HTTPException(status_code=404, detail=error)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/metrics")
async def api_metrics():
    try:
        throughput_gain = random.uniform(5.0, 15.0)
        delay_reduction = random.uniform(8.0, 20.0)
        active_trains_count = random.randint(10, 25)
        conflicts_prevented_count = random.randint(0, 5)
        return {
            "active_trains": active_trains_count,
            "conflicts_prevented": conflicts_prevented_count,
            "kpi_throughput_gain": f"{throughput_gain:.1f}%",
            "kpi_delay_reduction": f"{delay_reduction:.1f}%",
            "emergencies": emergency.get_emergencies() + [
                {"id": f"user-{i+1}", "train_no": "N/A", "type": "User Report",
                 "status": "pending", "description": e["description"]}
                for i, e in enumerate(_submitted_emergencies)
            ],
            "disasters": disaster.get_disasters(),
            "plan": planner.get_plan(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/routes")
async def api_routes():
    try:
        # FIX: work on deep copies so global _mock_train_data is never mutated
        snapshot = copy.deepcopy(_mock_train_data)
        for train in snapshot:
            max_km = ROUTE_MAX_KM.get(train["route"], 1500)
            train["position_km"] = min(train["position_km"] + random.randint(2, 6), max_km)

        routes: dict = {}
        for t in snapshot:
            routes.setdefault(t["route"], []).append(t)

        for route, tlist in routes.items():
            tlist.sort(key=lambda x: x["position_km"])
            for i in range(1, len(tlist)):
                tlist[i]["distance_from_prev"] = tlist[i]["position_km"] - tlist[i - 1]["position_km"]

        return routes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/emergency")
async def report_emergency(req: EmergencyRequest):
    try:
        if not req.description.strip():
            raise HTTPException(status_code=400, detail="Description cannot be empty")
        _submitted_emergencies.append({"description": req.description.strip()})
        return {"status": "received", "message": "Emergency report submitted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def api_query(query: QueryRequest):
    try:
        print(f"📩 Query received | Train: {query.train_no}, Subject: {query.subject}, Message: {query.message}")
        return {"status": "success", "message": "Query received"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.get("/api/weather/{city}")
async def api_weather(city: str):
    try:
        return weather.get_weather(city)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)