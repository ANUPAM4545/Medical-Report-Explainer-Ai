from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import get_settings
from app.models.schemas import Citation
from app.prompts.safety import DISCLAIMER_EN, DISCLAIMER_HI, HUMAN_PROMPT, SYSTEM_PROMPT
from app.rag.vector_store import get_vector_service
from app.services.history import get_session_history


def _format_docs(docs) -> str:
    formatted = []
    for doc in docs:
        metadata = doc.metadata
        source = (
            f"[{metadata.get('document_name', 'report')} "
            f"page {metadata.get('page_number', '?')} "
            f"chunk {metadata.get('chunk_index', '?')}]"
        )
        formatted.append(f"{source}\n{doc.page_content}")
    return "\n\n".join(formatted)


def _to_citations(docs) -> list[Citation]:
    citations: list[Citation] = []
    seen: set[tuple[str, int, int]] = set()
    for doc in docs:
        metadata = doc.metadata
        key = (
            str(metadata.get("document_name", "")),
            int(metadata.get("page_number", 0)),
            int(metadata.get("chunk_index", 0)),
        )
        if key in seen:
            continue
        seen.add(key)
        citations.append(
            Citation(
                document_name=key[0],
                page_number=key[1],
                chunk_index=key[2],
                preview=doc.page_content[:240].replace("\n", " ").strip(),
            )
        )
    return citations


class MedicalRAGService:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required for Gemini chat.")
        self.vector_service = get_vector_service()
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            google_api_key=settings.gemini_api_key,
        )
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_PROMPT),
                MessagesPlaceholder(variable_name="history"),
                ("human", HUMAN_PROMPT),
            ]
        )
        base_chain = (
            RunnablePassthrough.assign(
                context=lambda inputs: _format_docs(
                    self.vector_service.retriever(inputs["owner_id"]).invoke(inputs["question"])
                )
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )
        self.chain = RunnableWithMessageHistory(
            base_chain,
            get_session_history,
            input_messages_key="question",
            history_messages_key="history",
        )

    def answer(self, question: str, language: str, session_id: str, owner_id: str) -> tuple[str, list[Citation]]:
        docs = self.vector_service.retriever(owner_id).invoke(question)
        answer = self.chain.invoke(
            {"question": question, "language": language, "owner_id": owner_id},
            config={"configurable": {"session_id": session_id}},
        )
        return answer, _to_citations(docs)


_rag_service: MedicalRAGService | None = None


def get_rag_service() -> MedicalRAGService:
    global _rag_service
    if _rag_service is None:
        _rag_service = MedicalRAGService()
    return _rag_service


__all__ = ["DISCLAIMER_EN", "DISCLAIMER_HI", "MedicalRAGService", "get_rag_service"]
