"""FastAPIアプリケーションのエントリーポイント"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import chat
from app.api.v1 import stt as stt_api
from app.api.v1 import tts as tts_api

load_dotenv()

app = FastAPI(
    title="AudioDiary API",
    description="AudioDiary Backend API with Gemini AI",
    version="0.1.0",
)

# 環境変数からCORSのオリジンを取得(デフォルトはlocalhost)
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(stt_api.router, prefix="/api/v1/stt", tags=["stt"])
app.include_router(tts_api.router, prefix="/api/v1/tts", tags=["tts"])


@app.get("/")
async def root() -> dict[str, str]:
    """ヘルスチェックエンドポイント"""
    return {"message": "AudioDiary API is running"}


@app.get("/health")
async def health() -> dict[str, str]:
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}

