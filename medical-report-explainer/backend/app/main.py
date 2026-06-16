from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import get_settings


settings = get_settings()

app = FastAPI(
    title="Medical Report Explainer AI",
    description="Educational multilingual RAG platform for explaining medical reports with safety guardrails.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Medical Report Explainer AI",
        "purpose": "Educational information only. Not medical advice, diagnosis, or treatment.",
    }
