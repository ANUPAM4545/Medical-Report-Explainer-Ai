from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import get_settings
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    DocumentInfo,
    HealthResponse,
    TokenResponse,
    UploadResponse,
    UserCreate,
    UserLogin,
    UserPublic,
    GoogleLoginRequest,
)
from app.prompts.safety import DISCLAIMER_EN, DISCLAIMER_HI
from app.rag.chain import get_rag_service
from app.rag.document_processor import ReportDocumentProcessor
from app.rag.vector_store import get_vector_service
from app.services.auth import get_auth_service, get_current_user
from app.services.history import list_history

router = APIRouter(prefix="/api")


def _safe_document_name(filename: str) -> str:
    clean = Path(filename).name.replace(" ", "_")
    ext = clean.lower()
    allowed = [".pdf", ".jpg", ".jpeg", ".png", ".webp"]
    if not any(ext.endswith(suffix) for suffix in allowed):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and image reports (.png, .jpg, .jpeg, .webp) are supported."
        )
    return clean


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        vector_store=str(settings.vector_path),
        uploads=str(settings.uploads_path),
        llm_configured=bool(settings.gemini_api_key),
    )


@router.post("/auth/register", response_model=TokenResponse)
def register(payload: UserCreate) -> TokenResponse:
    auth = get_auth_service()
    user = auth.register(payload)
    return TokenResponse(access_token=auth.create_token(user), user=user)


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: UserLogin) -> TokenResponse:
    auth = get_auth_service()
    user = auth.authenticate(payload)
    return TokenResponse(access_token=auth.create_token(user), user=user)


@router.post("/auth/google", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest) -> TokenResponse:
    import urllib.request
    import urllib.parse
    import json

    GOOGLE_CLIENT_ID = "188815481005-4ruqi9omoshlnqsqmturucnmnvh1fbfu.apps.googleusercontent.com"
    token = payload.id_token
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(token)}"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="Invalid Google OAuth token response status.")
            google_user = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Failed to verify Google token with Google Identity Services.") from exc

    if google_user.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Google token audience mismatch.")

    email = google_user.get("email")
    name = google_user.get("name") or google_user.get("given_name") or "Google User"

    if not email:
        raise HTTPException(status_code=400, detail="Email not provided in Google account token.")

    auth = get_auth_service()
    user = auth.register_google(name, email)
    return TokenResponse(access_token=auth.create_token(user), user=user)


@router.get("/auth/me", response_model=UserPublic)
def me(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return user


@router.post("/upload", response_model=UploadResponse)
async def upload(files: list[UploadFile] = File(...), user: UserPublic = Depends(get_current_user)) -> UploadResponse:
    settings = get_settings()
    processor = ReportDocumentProcessor()
    vector_service = get_vector_service()

    filenames: list[str] = []
    total_chunks = 0
    user_upload_dir = settings.uploads_path / user.id
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    for uploaded in files:
        filename = _safe_document_name(uploaded.filename or "report.pdf")
        target = user_upload_dir / filename
        content = await uploaded.read()
        if not content:
            raise HTTPException(status_code=400, detail=f"{filename} is empty.")
        if len(content) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File {filename} exceeds the maximum allowed size of 20 MB.")
        target.write_bytes(content)

        vector_service.delete_document(filename, user.id)
        chunks = processor.chunk_document(target, user.id)
        total_chunks += vector_service.add_documents(chunks)
        filenames.append(filename)

    return UploadResponse(
        filenames=filenames,
        chunks_indexed=total_chunks,
        message="Reports uploaded and indexed successfully.",
    )


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, user: UserPublic = Depends(get_current_user)) -> ChatResponse:
    rag = get_rag_service()
    answer, citations = rag.answer(
        question=request.question,
        language=request.language.value,
        session_id=f"{user.id}:{request.session_id}",
        owner_id=user.id,
    )
    return ChatResponse(
        answer=answer,
        citations=citations,
        disclaimer_en=DISCLAIMER_EN,
        disclaimer_hi=DISCLAIMER_HI,
    )


@router.get("/documents", response_model=list[DocumentInfo])
def documents(user: UserPublic = Depends(get_current_user)) -> list[DocumentInfo]:
    return [DocumentInfo(**item) for item in get_vector_service().list_documents(user.id)]


@router.delete("/documents/{filename}")
def delete_document(filename: str, user: UserPublic = Depends(get_current_user)) -> dict[str, int | str]:
    settings = get_settings()
    deleted_chunks = get_vector_service().delete_document(filename, user.id)
    upload_path = settings.uploads_path / user.id / Path(filename).name
    if upload_path.exists():
        upload_path.unlink()
    return {"filename": filename, "deleted_chunks": deleted_chunks}


@router.get("/history")
def history(session_id: str = "default", user: UserPublic = Depends(get_current_user)):
    return list_history(f"{user.id}:{session_id}")


@router.delete("/history")
def delete_history(session_id: str = "default", user: UserPublic = Depends(get_current_user)):
    from app.services.history import clear_session_history
    clear_session_history(f"{user.id}:{session_id}")
    return {"message": "Chat history cleared successfully."}
