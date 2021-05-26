#!/bin/sh

# フロントエンドをビルド
cd frontend/
npm run build

# pythonライブラリ出力
cd ../backend/
pipenv lock -r > ../requirements.txt

cd ../
gcloud app deploy app-prod.yaml --project h-develop
