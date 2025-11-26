import os

from openai import OpenAI


class OpenAIService:
    """OpenAIのSTT/TTSを扱うサービスクラス"""

    def __init__(self) -> None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY が設定されていません")
        self.client = OpenAI(api_key=api_key)

    def transcribe_audio(self, file_bytes: bytes, filename: str, mime_type: str = "audio/webm") -> str:
        """音声バイト列をWhisperでテキスト化する"""
        try:
            # whisper-1 での文字起こし
            with self.client.audio.transcriptions.with_streaming_response.create(
                model="whisper-1",
                file=(filename, file_bytes, mime_type),
                response_format="json",
            ) as response:
                data = response.parse()
                # OpenAI Python SDK v1系の戻りに合わせて取り出し
                text = getattr(data, "text", None) or (data.get("text") if isinstance(data, dict) else None)
                if not text:
                    raise RuntimeError("Transcription response has no text")
                return text
        except Exception:
            raise

    def synthesize_speech(self, text: str, voice: str = "alloy", audio_format: str = "mp3") -> bytes:
        """テキストをOpenAIのTTSで音声化する"""
        try:
            result = self.client.audio.speech.create(
                model="gpt-4o-mini-tts",
                voice=voice,
                input=text,
                format=audio_format,
            )
            # SDKはバイナリを返す
            if hasattr(result, "read"):
                return result.read()
            if isinstance(result, (bytes, bytearray)):
                return bytes(result)
            # 一部実装で result.audio がbase64のことがあるため
            audio_bytes = getattr(result, "audio", None)
            if isinstance(audio_bytes, (bytes, bytearray)):
                return bytes(audio_bytes)
            raise RuntimeError("Unexpected TTS response format")
        except Exception:
            raise


