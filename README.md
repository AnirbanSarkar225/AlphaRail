# 🚆 AlphaRail

AlphaRail is a real-time railway management and monitoring dashboard. It provides live train tracking, route-wise positioning, conflict detection, emergency reporting, disaster monitoring, and AI-assisted planning — all through a clean web interface backed by a FastAPI server.

---

## 📁 Project Structure

```
AlphaRail/
├── backend/         # FastAPI Python backend
│   ├── main.py      # App entry point, all API routes
│   ├── database.py  # SQLAlchemy async DB setup
│   ├── emergency.py # Emergency data module
│   ├── disaster.py  # Disaster data module
│   ├── planner.py   # Operational planning module
│   ├── weather.py   # Weather impact module (OpenWeatherMap)
│   ├── railapi.py   # Indian Railways live schedule API
│   ├── models.py    # DB models
│   └── requirement.txt
└── frontend/        # Vanilla HTML/CSS/JS frontend
    ├── index.html
    └── app.js
```

---

## ⚙️ Prerequisites

- Python 3.10+
- pip

---

## 🚀 Getting Started

See [STARTUP.md](STARTUP.md) for full setup and run instructions.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/train/{train_no}` | Get train details |
| GET | `/api/trains_between` | Find trains between two stations |
| GET | `/api/schedule/{train_no}` | Live schedule via RapidAPI |
| GET | `/api/routes` | Route-wise live train positions |
| GET | `/api/metrics` | Dashboard KPIs, emergencies, plan |
| GET | `/api/weather/{city}` | Weather impact for a station |
| POST | `/api/query` | Submit a train query |

---

## 🌐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=sqlite+aiosqlite:///./alpharail_dev.db
OPENWEATHER_KEY=your_openweathermap_api_key
```

> For production, replace `DATABASE_URL` with a PostgreSQL connection string.

---

## 🛠️ Tech Stack

- **Backend:** FastAPI, Uvicorn, SQLAlchemy (async), aiosqlite
- **Frontend:** HTML, CSS, JavaScript, Chart.js, SweetAlert2
- **APIs:** OpenWeatherMap, RapidAPI (Indian Railways)

---

## 📄 License

MIT License — free to use and modify.
