from pathlib import Path
from uuid import uuid4

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import get_settings


class VectorStoreService:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required for embeddings and chat.")

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-2",
            google_api_key=settings.gemini_api_key,
        )
        self.store = Chroma(
            collection_name=settings.chroma_collection,
            embedding_function=self.embeddings,
            persist_directory=str(settings.vector_path),
        )

    def add_documents(self, documents: list[Document]) -> int:
        if not documents:
            return 0
        ids = [
            f"{doc.metadata['document_name']}::p{doc.metadata['page_number']}::c{doc.metadata['chunk_index']}::{uuid4().hex}"
            for doc in documents
        ]
        self.store.add_documents(documents=documents, ids=ids)
        return len(documents)

    def retriever(self, owner_id: str, k: int = 6):
        return self.store.as_retriever(search_kwargs={"k": k, "filter": {"owner_id": owner_id}})

    def list_documents(self, owner_id: str) -> list[dict]:
        raw = self.store.get(where={"owner_id": owner_id}, include=["metadatas"])
        grouped: dict[str, dict] = {}
        for metadata in raw.get("metadatas", []) or []:
            filename = metadata.get("document_name", "unknown")
            page = int(metadata.get("page_number", 0))
            entry = grouped.setdefault(filename, {"filename": filename, "chunks": 0, "pages": set()})
            entry["chunks"] += 1
            if page:
                entry["pages"].add(page)
        return [
            {"filename": item["filename"], "chunks": item["chunks"], "pages": sorted(item["pages"])}
            for item in grouped.values()
        ]

    def delete_document(self, filename: str, owner_id: str) -> int:
        raw = self.store.get(where={"$and": [{"document_name": filename}, {"owner_id": owner_id}]})
        ids = raw.get("ids", []) or []
        if ids:
            self.store.delete(ids=ids)
        return len(ids)


_vector_service: VectorStoreService | None = None


def get_vector_service() -> VectorStoreService:
    global _vector_service
    if _vector_service is None:
        _vector_service = VectorStoreService()
    return _vector_service
