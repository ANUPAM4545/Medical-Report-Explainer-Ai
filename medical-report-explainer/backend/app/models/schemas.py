from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class Language(str, Enum):
    en = "en"
    hi = "hi"
    both = "both"


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    language: Language = Language.both
    session_id: str = Field(default="default", max_length=128)


class Citation(BaseModel):
    document_name: str
    page_number: int
    chunk_index: int
    preview: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    disclaimer_en: str
    disclaimer_hi: str


class UploadResponse(BaseModel):
    filenames: list[str]
    chunks_indexed: int
    message: str


class DocumentInfo(BaseModel):
    filename: str
    chunks: int
    pages: list[int]


class HistoryMessage(BaseModel):
    role: str
    content: str


class HealthResponse(BaseModel):
    status: str
    vector_store: str
    uploads: str
    llm_configured: bool


class ErrorResponse(BaseModel):
    detail: str | dict[str, Any]


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: str = Field(..., min_length=5, max_length=254)
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    password: str = Field(..., min_length=8, max_length=128)


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    plan: str = "premium"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class GoogleLoginRequest(BaseModel):
    id_token: str
