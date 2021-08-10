# LT Web App

> Web app for LT.


## Backend Setup

バックエンドのFirebaseの環境設定を実施する
1. 下記から新しい秘密鍵を生成する<br>
https://console.firebase.google.com/u/1/project/h-develop2/settings/serviceaccounts/adminsdk?hl=ja
2. backend/secret/ 配下にJSONファイルを配置する
3. 初期設定スクリプトを実行する
``` bash
cd backend/
./init.sh <JSONファイルのパス>

# Ex.)
./init.sh secret/h-develop2-firebase-adminsdk-hbh6m-c3e2782116.json
```

## Frontend Deploy

``` bash
cd frontend/
npm install
npm run build
```

## Build Setup

``` bash
# Dockerでアプリ、サーバー、Firebaseエミュレーターを全てビルド&起動
docker-compose build
docker-compose up -d

# アプリだけリビルドする
docker-compose up -d --no-deps --build frontend
# サーバーだけリビルドする
docker-compose up -d --no-deps --build backend
# Firebaseエミュレーターだけリビルドする
docker-compose up -d --no-deps --build firebase

# アプリ: http://localhost:3000/
# サーバー: http://localhost:5000/
# FirebaseエミュレーターのUI管理画面: http://localhost:4000/
```


## Deploy Setup

``` bash
# GAEにデプロイする
# フロントエンドのビルドも実施するため、時間がかかる場合がある
./deploy.sh
