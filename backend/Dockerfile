FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /workspace/backend

RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY backend/pyproject.toml backend/uv.lock backend/README.md ./
RUN uv sync --frozen

FROM python:3.11-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /workspace/backend

# セキュアな非rootユーザー
RUN useradd -m -u 1000 appuser
USER appuser

# 依存関係の仮想環境をコピー
COPY --from=builder /workspace/backend/.venv /workspace/backend/.venv

# アプリコードをコピー
COPY backend/app ./app

EXPOSE 8000

# ヘルスチェック（/health）
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD ./.venv/bin/python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health').read()"

# App Runnerでは単一プロセスで起動（App Runnerが自動スケーリングするため）
CMD ["./.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

