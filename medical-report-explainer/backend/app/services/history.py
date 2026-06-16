import sqlite3
import time
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from app.config import get_settings
from app.models.schemas import HistoryMessage


class SQLiteChatMessageHistory(BaseChatMessageHistory):
    def __init__(self, session_id: str, db_path: str) -> None:
        self.session_id = session_id
        self.db_path = db_path
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_db(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                )
                """
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)"
            )

    @property
    def messages(self) -> list[BaseMessage]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id ASC",
                (self.session_id,),
            ).fetchall()

        messages_list = []
        for row in rows:
            role = row["role"]
            content = row["content"]
            if role == "human":
                messages_list.append(HumanMessage(content=content))
            else:
                messages_list.append(AIMessage(content=content))
        return messages_list

    def add_message(self, message: BaseMessage) -> None:
        role = "human" if isinstance(message, HumanMessage) else "ai"
        with self._connect() as connection:
            connection.execute(
                "INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (self.session_id, role, message.content, int(time.time())),
            )

    def clear(self) -> None:
        with self._connect() as connection:
            connection.execute("DELETE FROM chat_messages WHERE session_id = ?", (self.session_id,))


def get_session_history(session_id: str) -> SQLiteChatMessageHistory:
    return SQLiteChatMessageHistory(session_id, str(get_settings().auth_db))


def list_history(session_id: str = "default") -> list[HistoryMessage]:
    history_store = get_session_history(session_id)
    return [
        HistoryMessage(
            role="user" if message.type == "human" else "assistant",
            content=str(message.content),
        )
        for message in history_store.messages
    ]


def clear_session_history(session_id: str) -> None:
    get_session_history(session_id).clear()
