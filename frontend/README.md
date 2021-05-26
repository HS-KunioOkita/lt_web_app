# lt_web_app

> web app for LT.

## Build Setup

``` bash
# バックエンドサーバーを起動しておく
# Dockerでアプリ、サーバー、Firebaseエミュレーターを全てビルド&起動
docker-compose build
docker-compose up -d

# ホットリロードでフロントエンドサーバーを起動する(localhost:3000)
docker-compose up -d --no-deps --build frontend

# ここから下は下記ディレクトリでコマンドを実行する
cd frontend/

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
