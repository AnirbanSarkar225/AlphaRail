# 🚀 AlphaRail — Startup Guide

This guide will get both the backend and frontend running locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/alpharail.git
cd alpharail
```

---

## 2. Backend Setup

### Navigate to the backend folder
```powershell
cd backend
```

### Create and activate a virtual environment (recommended)
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### Install dependencies
```powershell
pip install -r requirement.txt
```

### Set up environment variables
Create a `.env` file inside the `backend/` folder:
```env
DATABASE_URL=sqlite+aiosqlite:///./alpharail_dev.db
OPENWEATHER_KEY=your_openweathermap_api_key
```

> If you don't have an OpenWeatherMap key, weather endpoints will return `api_key_missing` but everything else will still work.

### Start the backend server
```powershell
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

The API is now live at **http://localhost:8000**

---

## 3. Frontend Setup

Open a **second PowerShell window** and run:

```powershell
cd frontend
python -m http.server 3000
```

Then open your browser and go to:
```
http://localhost:3000
```

> ⚠️ Do NOT open `index.html` directly as a file (`file://`). Always use the HTTP server at `localhost:3000`, otherwise the frontend cannot connect to the backend.

---

## 4. Verify Everything Works

- ✅ Backend health check: http://localhost:8000
- ✅ API docs (Swagger UI): http://localhost:8000/docs
- ✅ Frontend dashboard: http://localhost:3000

---

## 5. Stopping the Servers

Press `Ctrl + C` in each PowerShell window to stop the backend and frontend servers.
