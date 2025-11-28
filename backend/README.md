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
- `OPENAI_API_KEY`: OpenAI APIのキー（STT/TTSで使用）

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

## Dockerでの起動

### 事前準備

- `backend/.env`を用意する（`.env.example`をコピーするか、新規作成）
- 必須環境変数: `GEMINI_API_KEY`

```bash
cd backend
cp .env.example .env  # 既に存在する場合はスキップ
```

### 開発モード（Docker Compose）

ホットリロード対応（コード変更が自動反映）。ローカルポートは`8001`に公開されます。

```bash
cd backend
docker compose --profile dev up -d --build
```

ヘルスチェック:

```bash
curl http://localhost:8001/health
```

便利コマンド:

```bash
# ログの確認
docker compose --profile dev logs -f api

# 再ビルド（依存関係やベースイメージ更新時）
docker compose --profile dev up -d --build

# 停止と削除
docker compose --profile dev down

# ボリュームも削除（仮想環境 .venv を初期化したい場合）
docker compose --profile dev down -v
```

### 本番モード（Docker Compose）

`.env`またはシェル環境に`GEMINI_API_KEY`を設定してから起動します。公開ポートは`8001`です。

```bash
cd backend
docker compose --profile prod up -d --build
# 特定サービスのみ起動したい場合
# docker compose --profile prod up -d api-prod
```

ヘルスチェック:

```bash
curl http://localhost:8001/health
```

停止:

```bash
docker compose --profile prod down
```

### Composeを使わずに直接Dockerで起動（任意）

```bash
# ビルド（リポジトリルートで実行）
docker build -f backend/Dockerfile -t audiodiary-backend:latest .

# 実行（backend/.env を読み込む）
docker run --rm --name audiodiary-backend \
  --env-file backend/.env \
  -p 8001:8000 \
  audiodiary-backend:latest
```

- アクセス例: `http://localhost:8001/health`
- API例: `http://localhost:8001/api/v1/chat/message`
