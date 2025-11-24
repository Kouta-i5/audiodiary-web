FROM python:3.11-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY backend-py/pyproject.toml backend-py/uv.lock /workspace/backend-py/

WORKDIR /workspace/backend-py

RUN uv sync

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

