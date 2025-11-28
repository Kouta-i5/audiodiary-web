import json
from collections.abc import Iterator

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

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
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/transcribe/stream", summary="音声をテキスト化(ストリーミング)SSE")
async def transcribe_audio_stream(file: UploadFile = File(...)) -> StreamingResponse:
    """
    音声を文字起こしし、SSEで部分テキストを逐次返す

    - イベント: data: {"delta": "テキストの断片"}
    - 完了時: data: {"done": true, "text": "全文"}
    """
    try:
        content = await file.read()
        service = OpenAIService()

        def sse_generator() -> Iterator[str]:
            try:
                acc = ""
                for delta in service.stream_transcription_tokens(
                    content, filename=file.filename or "audio.webm", mime_type=file.content_type or "audio/webm"
                ):
                    acc += delta
                    yield f"data: {json.dumps({'delta': delta})}\n\n"
                yield f"data: {json.dumps({'done': True, 'text': acc})}\n\n"
            except Exception as exc:
                yield f"event: error\ndata: {json.dumps({'error': str(exc)})}\n\n"

        return StreamingResponse(sse_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


