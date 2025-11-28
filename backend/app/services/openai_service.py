import logging
import os

from openai import OpenAI


class OpenAIService:
    """OpenAIのSTT/TTSを扱うサービスクラス"""

    def __init__(self) -> None:
        self._logger = logging.getLogger(__name__)
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY が設定されていません")
        self.client = OpenAI(api_key=api_key)

    def transcribe_audio(self, file_bytes: bytes, filename: str, mime_type: str = "audio/webm") -> str:
        """音声バイト列をテキスト化する

        Args:
            file_bytes: 音声ファイルのバイト列
            filename: ファイル名
            mime_type: MIMEタイプ

        Returns:
            文字起こし結果の全文

        Raises:
            Exception: 文字起こしに失敗した場合
        """
        try:
            # 高品質なSTTモデルに切り替え
            with self.client.audio.transcriptions.with_streaming_response.create(
                model="gpt-4o-mini-transcribe",
                file=(filename, file_bytes, mime_type),
                response_format="text",
            ) as response:
                data = response.parse()
                # response_format="text" の場合はそのままテキスト
                if isinstance(data, str):
                    return data
                # 念のためJSON形式にも対応
                text = getattr(data, "text", None) or (data.get("text") if isinstance(data, dict) else None)
                if not text:
                    raise RuntimeError("Transcription response has no text")
                return str(text)
        except Exception:
            raise

    def synthesize_speech(self, text: str, voice: str = "alloy", audio_format: str = "mp3") -> bytes:
        """テキストをOpenAIのTTSで音声化する"""
        try:
            # 1st try: streaming + format明示
            try:
                with self.client.audio.speech.with_streaming_response.create(
                    model="gpt-4o-mini-tts",
                    voice=voice,
                    input=text,
                    format=audio_format,
                ) as response:
                    return response.read()
            except Exception as e1:
                self._logger.warning("TTS(streaming,format)失敗: %s", str(e1))
                # 2nd try: streaming(デフォルトフォーマット)
                try:
                    with self.client.audio.speech.with_streaming_response.create(
                        model="gpt-4o-mini-tts",
                        voice=voice,
                        input=text,
                    ) as response:
                        return response.read()
                except Exception as e2:
                    self._logger.warning("TTS(streaming,default)失敗: %s", str(e2))
                    # 3rd try: 非ストリーミング
                    try:
                        result = self.client.audio.speech.create(
                            model="gpt-4o-mini-tts",
                            voice=voice,
                            input=text,
                            format=audio_format,
                        )
                        if hasattr(result, "read"):
                            return result.read()
                        audio_bytes = getattr(result, "audio", None)
                        if isinstance(audio_bytes, (bytes, bytearray)):
                            return bytes(audio_bytes)
                        # 一部SDKはbase64等を返す可能性があるため最後にbytes()で強制
                        return bytes(result)  # type: ignore[arg-type]
                    except Exception as e3:
                        self._logger.error("TTS失敗(全リトライ失敗): %s", str(e3))
                        raise
        except Exception as e:
            self._logger.exception("TTS処理中にエラー: %s", str(e))
            raise

    def stream_transcription_tokens(self, file_bytes: bytes, filename: str, mime_type: str = "audio/webm"):
        """文字起こし結果をトークン単位で逐次生成するジェネレータ

        OpenAIのストリーミングが利用不可の場合にも、最終結果を擬似的に分割して返す。

        Args:
            file_bytes: 音声ファイルのバイト列
            filename: ファイル名
            mime_type: MIMEタイプ

        Yields:
            逐次出力するテキスト断片
        """
        try:
            # まずは最終結果を取得
            full_text = self.transcribe_audio(file_bytes, filename, mime_type)
            # 単語単位で区切って擬似ストリーム
            for token in full_text.split():
                yield token + " "
        except Exception:
            raise


