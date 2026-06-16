from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class ReportDocumentProcessor:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def load_pdf_pages(self, path: Path) -> list[Document]:
        pages = PyPDFLoader(str(path)).load()
        text_chars = sum(len(page.page_content.strip()) for page in pages)
        if text_chars >= 80:
            return pages

        # OCR/scanned PDF fallback. Requires poppler-utils and tesseract-ocr in production.
        try:
            from pdf2image import convert_from_path
            import pytesseract

            images = convert_from_path(str(path), dpi=200)
            return [
                Document(
                    page_content=pytesseract.image_to_string(image, lang="eng+hin"),
                    metadata={"page_number": index + 1, "source": str(path)},
                )
                for index, image in enumerate(images)
            ]
        except Exception:
            return pages

    def load_image(self, path: Path) -> list[Document]:
        try:
            from PIL import Image
            import pytesseract

            image = Image.open(path)
            text = pytesseract.image_to_string(image, lang="eng+hin")
            return [
                Document(
                    page_content=text,
                    metadata={"page_number": 1, "source": str(path)},
                )
            ]
        except Exception:
            return []

    def chunk_pdf(self, path: Path, owner_id: str) -> list[Document]:
        return self.chunk_document(path, owner_id)

    def chunk_document(self, path: Path, owner_id: str) -> list[Document]:
        chunks: list[Document] = []
        is_image = path.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]
        pages = self.load_image(path) if is_image else self.load_pdf_pages(path)
        for page in pages:
            raw_page_number = page.metadata.get("page_number")
            page_number = int(raw_page_number) if raw_page_number else int(page.metadata.get("page", 0)) + 1
            page_text = page.page_content.strip()
            if not page_text:
                continue

            page_chunks = self.splitter.split_text(page_text)
            for chunk_index, text in enumerate(page_chunks):
                chunks.append(
                    Document(
                        page_content=text,
                        metadata={
                            "document_name": path.name,
                            "page_number": page_number,
                            "chunk_index": chunk_index,
                            "owner_id": owner_id,
                        },
                    )
                )
        return chunks
