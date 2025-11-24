"""チャット関連のAPIエンドポイント"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.gemini_service import GeminiService

router = APIRouter()
gemini_service = GeminiService()


class ChatMessageRequest(BaseModel):
    """チャットメッセージリクエスト"""
    content: str
    context: list[dict] | None = None


class ChatMessageResponse(BaseModel):
    """チャットメッセージレスポンス"""
    content: str


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest) -> ChatMessageResponse:
    """
    ユーザーメッセージに対するAI応答を生成

    Args:
        request: チャットメッセージリクエスト

    Returns:
        AIからの応答

    Raises:
        HTTPException: メッセージ生成に失敗した場合
    """
    try:
        response = await gemini_service.generate_response(
            user_message=request.content,
            context=request.context,
        )
        return ChatMessageResponse(content=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"メッセージ生成に失敗しました: {e!s}") from e


@router.post("/summarize")
async def summarize_conversation(request: dict) -> dict:
    """
    会話履歴を要約

    Args:
        request: 会話履歴を含むリクエスト

    Returns:
        要約されたテキスト

    Raises:
        HTTPException: 要約生成に失敗した場合
    """
    try:
        conversation = request.get("conversation", "")
        if not conversation:
            raise HTTPException(status_code=400, detail="会話履歴が提供されていません")

        summary = await gemini_service.summarize_conversation(conversation)
        return {"summary": summary}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"要約生成に失敗しました: {e!s}") from e

