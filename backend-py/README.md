# AudioDiary Backend API

AudioDiaryのバックエンドAPIサーバー。Gemini APIを使用した生成AI機能を提供します。

## セットアップ

### 1. 依存関係のインストール

```bash
uv sync
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な環境変数を設定してください。

```bash
cp .env.example .env
```

`.env`ファイルに以下を設定:
- `GEMINI_API_KEY`: Gemini APIのキー

### 3. サーバーの起動

```bash
uv run uvicorn app.main:app --reload --port 8000
```

## 開発

### Linterの実行

```bash
uv run ruff check .
uv run ruff format .
```

### 型チェック

```bash
uv run mypy app
```

### テストの実行

```bash
uv run pytest
```

## APIエンドポイント

- `GET /`: ヘルスチェック
- `GET /health`: ヘルスチェック
- `POST /api/v1/chat/message`: チャットメッセージの送信
- `POST /api/v1/chat/summarize`: 会話履歴の要約

