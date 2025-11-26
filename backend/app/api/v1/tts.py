from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.services.openai_service import OpenAIService

router = APIRouter()


class TTSRequest(BaseModel):
    text: str = Field(..., description="音声化するテキスト")
    voice: str = Field("alloy", description="音声ボイス名")
    format: str = Field("mp3", description="音声フォーマット(mp3/wavなど)")


@router.post("/synthesize", summary="テキストを音声化(TTS)")
async def synthesize(req: TTSRequest) -> Response:
    try:
        service = OpenAIService()
        audio = service.synthesize_speech(req.text, voice=req.voice, audio_format=req.format)
        media_type = "audio/mpeg" if req.format == "mp3" else "application/octet-stream"
        return Response(content=audio, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


