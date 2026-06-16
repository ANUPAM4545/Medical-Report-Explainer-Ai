import axios from "axios";
import type { AuthResponse, ChatResponse, DocumentInfo, HistoryMessage, Language, UploadResponse, User } from "../types/api";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medical-report-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registerUser(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", { name, email, password });
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

export async function uploadReports(files: File[], onProgress?: (progress: number) => void) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const { data } = await api.post<UploadResponse>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
    },
  });
  return data;
}

export async function askReport(question: string, language: Language, sessionId = "default") {
  const { data } = await api.post<ChatResponse>("/api/chat", {
    question,
    language,
    session_id: sessionId,
  });
  return data;
}

export async function getDocuments() {
  const { data } = await api.get<DocumentInfo[]>("/api/documents");
  return data;
}

export async function deleteDocument(filename: string) {
  const { data } = await api.delete(`/api/documents/${encodeURIComponent(filename)}`);
  return data;
}

export async function getHistory(sessionId = "default") {
  const { data } = await api.get<HistoryMessage[]>("/api/history", { params: { session_id: sessionId } });
  return data;
}

export async function clearHistory(sessionId = "default") {
  const { data } = await api.delete("/api/history", { params: { session_id: sessionId } });
  return data;
}

export async function loginWithGoogle(idToken: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/google", { id_token: idToken });
  return data;
}
