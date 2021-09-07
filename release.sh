#!/bin/sh

function usage() {
cat <<_EOT_
Usage:
  $0 [version]

Description:
  releaseスクリプト。ブランチ作成&push、tag作成&pushまで実施する。
  version: リリースバージョン（x.x.x）

_EOT_
exit 1
}

if [ $# != 1 ]; then
  usage
fi

version=$1
# バージョンはx.x.x形式のみ受け付ける
if [[ ! $version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  usage
fi

# 最新のdevelopブランチ取得
git fetch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
if [[ ! $CURRENT_BRANCH = develop ]]; then
  git checkout develop
fi
git pull

RELEASE_BRANCH=release/$version
# リリースブランチ作成済みの場合は弾く
if [[ `git branch --list $RELEASE_BRANCH` ]]; then
  echo "$RELEASE_BRANCH はローカル上に作成済みです"
  exit 1
elif [[ `git branch -a --list origin/$RELEASE_BRANCH` ]]; then
  echo "$RELEASE_BRANCH はリモート上に作成済みです"
  exit 1
fi

# リリースブランチ作成
$(git checkout -b $RELEASE_BRANCH)
MAIN_PATH=frontend/src/main.js
sed -i -e "s/v0.0.1/v$version/g" $MAIN_PATH
git add $MAIN_PATH
git commit -m "バージョン$version設定"

git push origin $RELEASE_BRANCH

# tag作成
git tag -a v$version -m "version $version"
git push origin v$version