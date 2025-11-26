"""APIリクエスト/レスポンスのスキーマ定義"""
from typing import Any

from pydantic import BaseModel


class Message(BaseModel):
    """メッセージ"""
    role: str
    content: str


class ChatMessageRequest(BaseModel):
    """チャットメッセージリクエスト"""
    content: str
    messages: list[Message] | None = None
    context: list[dict[str, Any]] | None = None


class ChatMessageResponse(BaseModel):
    """チャットメッセージレスポンス"""
    content: str


class SummarizeRequest(BaseModel):
    """要約リクエスト"""
    conversation: str


class SummarizeResponse(BaseModel):
    """要約レスポンス"""
    summary: str

