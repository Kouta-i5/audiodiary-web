"""チャット関連のAPIエンドポイント"""
import logging

from fastapi import APIRouter, HTTPException

from app.api.v1.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter()
gemini_service = GeminiService()


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
        messages_history = None
        if request.messages:
            messages_history = [
                {"role": msg.role, "content": msg.content} for msg in request.messages
            ]

        logger.info(f"リクエスト受信: content={request.content[:50]}, context={len(request.context) if request.context else 0}件, messages={len(messages_history) if messages_history else 0}件")
        response = await gemini_service.generate_response(
            user_message=request.content,
            context=request.context,
            messages_history=messages_history,
        )
        return ChatMessageResponse(content=response)
    except Exception as e:
        logger.error(f"メッセージ生成エラー: {type(e).__name__}: {e!s}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"メッセージ生成に失敗しました: {e!s}") from e


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_conversation(request: SummarizeRequest) -> SummarizeResponse:
    """
    会話履歴を要約

    Args:
        request: 要約リクエスト

    Returns:
        要約されたテキスト

    Raises:
        HTTPException: 要約生成に失敗した場合
    """
    try:
        if not request.conversation:
            raise HTTPException(status_code=400, detail="会話履歴が提供されていません")

        summary = await gemini_service.summarize_conversation(request.conversation)
        return SummarizeResponse(summary=summary)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"要約生成に失敗しました: {e!s}") from e

