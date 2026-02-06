import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.routes import router
from .config import settings

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="ToolChecker by &samhoud",
    description="AVG/GDPR Compliance Checker voor tools en software",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Serveer de gebouwde frontend (alleen in productie, niet wanneer dev-server draait)
# De StaticFiles mount op "/" moet ONDER alle API routes staan.
# Starlette verwerkt routes in volgorde — de router routes worden eerst gecheckt.
import os

_frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if _frontend_dist.is_dir() and os.environ.get("SERVE_FRONTEND", "").lower() == "true":
    app.mount("/", StaticFiles(directory=str(_frontend_dist), html=True), name="frontend")
