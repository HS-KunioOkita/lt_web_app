#!/bin/sh

# dev.envファイル作成
cd ../
touch dev.env
echo GOOGLE_APPLICATION_CREDENTIALS=$1 > dev.env

# secret.yamlファイル作成
touch secret.yaml
cat <<EOF > secret.yaml
env_variables:
  GOOGLE_APPLICATION_CREDENTIALS: backend/$1
EOF