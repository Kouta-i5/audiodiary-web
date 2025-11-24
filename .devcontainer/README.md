# Dev Container セットアップ

このディレクトリには、バックエンド開発環境のDocker Compose設定が含まれています。

## 使用方法

### 1. 環境変数の設定

`.devcontainer/.env`ファイルを作成し、以下の環境変数を設定してください：

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Dev Containerの起動

Cursor/VS Codeで「Reopen in Container」を選択するか、以下のコマンドで起動：

```bash
docker-compose -f .devcontainer/docker-compose.yml up -d
```

### 3. コンテナへの接続

```bash
docker exec -it audiodiary-backend bash
```

### 4. 手動でのビルドと起動

```bash
cd .devcontainer
docker-compose build
docker-compose up
```

### 5. 環境の停止

#### Docker Composeで起動した場合

```bash
# .devcontainerディレクトリで実行
cd .devcontainer
docker-compose down
```

または、プロジェクトルートから：

```bash
docker-compose -f .devcontainer/docker-compose.yml down
```

#### 個別のコンテナを停止する場合

```bash
# コンテナ名で停止
docker stop audiodiary-backend

# 停止して削除する場合
docker rm -f audiodiary-backend
```

#### すべての実行中コンテナを停止する場合

```bash
docker stop $(docker ps -q)
```

## 構成

- **Dockerfile**: Python 3.11 + uv を使用したバックエンド環境
- **docker-compose.yml**: バックエンドサービスの定義
- **devcontainer.json**: Cursor/VS Code Dev Container設定

## ポート

- `8000`: FastAPIバックエンドAPI
