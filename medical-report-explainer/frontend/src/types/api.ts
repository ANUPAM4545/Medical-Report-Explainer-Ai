export type Language = "en" | "hi" | "both";

export interface Citation {
  document_name: string;
  page_number: number;
  chunk_index: number;
  preview: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  disclaimer_en: string;
  disclaimer_hi: string;
}

export interface DocumentInfo {
  filename: string;
  chunks: number;
  pages: number[];
}

export interface HistoryMessage {
  role: string;
  content: string;
}

export interface UploadResponse {
  filenames: string[];
  chunks_indexed: number;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "premium" | string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}
