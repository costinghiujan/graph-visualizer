# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Graph Visualizer API", version="1.0.0")

# Permite comunicarea cu frontend-ul (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Portul implicit Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> dict:
    return {"message": "Welcome to Graph Visualizer API. Visit /api/health or /docs"}

@app.get("/api/health")
async def health_check() -> dict:
    return {"status": "ok", "message": "Graph Visualizer API is running"}