"""Gemini APIを使用した生成AIサービス"""
import os
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    """Gemini APIを使用した生成AIサービスクラス"""

    def __init__(self) -> None:
        """
        GeminiServiceの初期化

        Raises:
            ValueError: GEMINI_API_KEYが設定されていない場合
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEYが環境変数に設定されていません")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-pro")

    def _build_system_prompt(self, context: list[dict[str, Any]] | None = None) -> str:
        """
        システムプロンプトを構築

        Args:
            context: コンテキスト情報(イベント情報など)

        Returns:
            構築されたシステムプロンプト
        """
        base_prompt = """あなたは親しみやすい日記アシスタントです。
ユーザーとの会話を通じて、その日の出来事や感情を理解し、自然な会話を心がけてください。
"""
        if context:
            context_text = "\n".join([
                f"- {item.get('summary', '')}: {item.get('description', '')}"
                for item in context
            ])
            base_prompt += f"\n\n今日の予定:\n{context_text}\n\nこれらの予定について会話を始めてください。"
        return base_prompt

    async def generate_response(
        self,
        user_message: str,
        context: list[dict[str, Any]] | None = None,
    ) -> str:
        """
        ユーザーメッセージに対するAI応答を生成

        Args:
            user_message: ユーザーからのメッセージ
            context: コンテキスト情報(イベント情報など)

        Returns:
            AIからの応答テキスト

        Raises:
            Exception: API呼び出しに失敗した場合
        """
        try:
            system_prompt = self._build_system_prompt(context)
            full_prompt = f"{system_prompt}\n\nユーザー: {user_message}\nアシスタント:"

            response = self.model.generate_content(full_prompt)
            if not response.text:
                raise Exception("Gemini APIからの応答が空です")
            return str(response.text)
        except Exception as e:
            raise Exception(f"Gemini API呼び出しに失敗しました: {e!s}") from e

    async def summarize_conversation(self, conversation: str) -> str:
        """
        会話履歴を要約

        Args:
            conversation: 会話履歴のテキスト

        Returns:
            要約されたテキスト

        Raises:
            Exception: API呼び出しに失敗した場合
        """
        try:
            prompt = f"""以下の会話履歴を要約してください。
会話の要点、重要な出来事、感情などを簡潔にまとめてください。

会話履歴:
{conversation}

要約:"""

            response = self.model.generate_content(prompt)
            if not response.text:
                raise Exception("要約生成の応答が空です")
            return str(response.text)
        except Exception as e:
            raise Exception(f"要約生成に失敗しました: {e!s}") from e

