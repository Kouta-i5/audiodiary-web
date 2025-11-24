"""FastAPIアプリケーションのエントリーポイント"""
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import chat

load_dotenv()

app = FastAPI(
    title="AudioDiary API",
    description="AudioDiary Backend API with Gemini AI",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])


@app.get("/")
async def root() -> dict[str, str]:
    """ヘルスチェックエンドポイント"""
    return {"message": "AudioDiary API is running"}


@app.get("/health")
async def health() -> dict[str, str]:
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}

