from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.services.openai_service import OpenAIService

router = APIRouter()


@router.post("/transcribe", summary="音声をテキスト化(Whisper)")
async def transcribe_audio(file: UploadFile = File(...)) -> JSONResponse:
    try:
        content = await file.read()
        service = OpenAIService()
        text = service.transcribe_audio(content, filename=file.filename or "audio.webm", mime_type=file.content_type or "audio/webm")
        return JSONResponse({"text": text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


