"""Gemini APIを使用した生成AIサービス"""
import os
from datetime import datetime
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
        # Gemini 2.0 Flash-Lite 安定版を使用(本番環境推奨)
        # 参考: https://ai.google.dev/gemini-api/docs/models?hl=ja
        # 他の選択肢:
        # - gemini-2.0-flash-lite (最新版)
        # - gemini-3-pro-preview (プレビュー版、高性能)
        self.model = genai.GenerativeModel("gemini-2.0-flash-lite-001")

    def _build_system_prompt(self, context: list[dict[str, Any]] | None = None) -> str:
        """
        システムプロンプトを構築

        Args:
            context: コンテキスト情報(イベント情報など)

        Returns:
            構築されたシステムプロンプト
        """
        base_prompt = """あなたは親しみやすい日記アシスタントです。
ユーザーとの会話を通じて、過去の出来事や感情を深掘りし、日記作成を支援してください。
"""
        if context:
            context_parts = []

            for item in context:
                summary = item.get("summary", "")
                description = item.get("description", "")
                start = item.get("start", "")
                end = item.get("end", "")
                location = item.get("location", "")

                event_text = f"- {summary}"
                if description:
                    event_text += f": {description}"

                # 時刻フォーマットの改善と日付の判定
                time_info = ""
                event_date = None

                if start:
                    if start.startswith(("2024-", "2025-")):
                        try:
                            start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                            event_date = start_dt.date()

                            if end:
                                end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
                                if start_dt.date() == end_dt.date():
                                    if start_dt.hour == 0 and start_dt.minute == 0 and end_dt.hour == 23 and end_dt.minute == 59:
                                        time_info = " (終日)"
                                    else:
                                        time_info = f" ({start_dt.strftime('%H:%M')} - {end_dt.strftime('%H:%M')})"
                                else:
                                    time_info = f" ({start_dt.strftime('%m/%d %H:%M')} - {end_dt.strftime('%m/%d %H:%M')})"
                            else:
                                time_info = f" ({start_dt.strftime('%H:%M')})"
                        except (ValueError, AttributeError):
                            time_info = f" ({start})"
                    else:
                        time_info = f" ({start})"

                event_text += time_info
                if location:
                    event_text += f" [場所: {location}]"

                # 日付情報を追加(過去の出来事であることを明示)
                if event_date:
                    event_text += f" [日付: {event_date.strftime('%Y年%m月%d日')}]"

                context_parts.append(event_text)

            context_text = "\n".join(context_parts)
            event_count = len(context)
            base_prompt += f"\n\n過去に行った出来事({event_count}件):\n{context_text}\n\n重要な注意事項:\n- これらは既に終了した過去の出来事です\n- 「これから」「予定」「行く」などの未来形は使わないでください\n- 過去形「行った」「参加した」「終わった」などを使ってください\n- ユーザーが実際に何をしたか、どう感じたかを深掘りして聞いてください\n- 出来事の詳細、その時の感情、学びや気づきなどを引き出し、日記作成に役立つ情報を集めてください\n- 自然な会話で、過去の体験を振り返るような質問をしてください"
        return base_prompt

    async def generate_response(
        self,
        user_message: str,
        context: list[dict[str, Any]] | None = None,
        messages_history: list[dict[str, str]] | None = None,
    ) -> str:
        """
        ユーザーメッセージに対するAI応答を生成

        Args:
            user_message: ユーザーからのメッセージ
            context: コンテキスト情報(イベント情報など)
            messages_history: 会話履歴

        Returns:
            AIからの応答テキスト

        Raises:
            Exception: API呼び出しに失敗した場合
        """
        try:
            system_prompt = self._build_system_prompt(context)

            if messages_history:
                history_text = "\n".join([
                    f"{msg['role']}: {msg['content']}"
                    for msg in messages_history
                ])
                full_prompt = f"{system_prompt}\n\n会話履歴:\n{history_text}\n\nユーザー: {user_message}\nアシスタント:"
            else:
                full_prompt = f"{system_prompt}\n\nユーザー: {user_message}\nアシスタント:"

            response = self.model.generate_content(full_prompt)
            if not response.text:
                raise Exception("Gemini APIからの応答が空です")
            return str(response.text)
        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg or "not found" in error_msg.lower():
                raise Exception(
                    f"Geminiモデルが見つかりません。モデル名を確認してください。エラー: {error_msg}"
                ) from e
            raise Exception(f"Gemini API呼び出しに失敗しました: {error_msg}") from e

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
            prompt = f"""以下の会話履歴を基に、大人が書く日記のような文章を作成してください。
以下の点に注意してください:

1. 一人称で書く(「私は」「自分は」など)
2. 自然で感情的な表現を使う
3. 出来事の詳細だけでなく、その時の感情や考えも含める
4. 簡潔だが、読み手がその日の様子を理解できる内容にする
5. 堅すぎず、かといって砕けすぎない丁寧な文体
6. 「アシスタントとの会話」「AIとの会話」などの言及は不要で、自然に日記として書く

会話履歴:
{conversation}

日記:"""

            response = self.model.generate_content(prompt)
            if not response.text:
                raise Exception("要約生成の応答が空です")
            return str(response.text)
        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg or "not found" in error_msg.lower():
                raise Exception(
                    f"Geminiモデルが見つかりません。モデル名を確認してください。エラー: {error_msg}"
                ) from e
            raise Exception(f"要約生成に失敗しました: {error_msg}") from e

