# Frontend

> Webアプリ本体

## Build Setup

``` bash
# 開発環境での動作確認は、backendとfirebaseの起動が必須
# Dockerで全てビルド&起動しておく
docker-compose build
docker-compose up -d

# serve with hot reload at localhost:3000（ソースコードが変更されると自動リロードされる）
docker-compose up -d --no-deps --build frontend

# ここから下を実施する場合は下記ディレクトリでコマンドを実行する
cd frontend/

# ライブラリを追加する
npm install <パッケージ名>

# 製品環境用に成果物をビルドする
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
