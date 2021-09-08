#!/bin/bash

function usage() {
cat <<_EOT_
Usage:
  $0 [version] [run_mode]

Description:
  releaseスクリプト。ブランチ作成&push、tag作成&pushまで実施する。
  version: リリースバージョン（x.x.x）
  run_mode: runを指定した時のみ本番実行(dryrunは実行予定のコマンドを表示)

_EOT_
exit 1
}

if [ $# != 2 ]; then
  usage
fi

version=$1
run_mode=$2
# バージョンはx.x.x形式のみ受け付ける
if [[ ! $version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  usage
fi

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
is_develop=false
if [[ ! $CURRENT_BRANCH = develop ]]; then
  is_develop=true
fi

RELEASE_BRANCH=release/$version
local_release_branch_exists=false
remote_release_branch_exists=false
if [[ `git branch --list $RELEASE_BRANCH` ]]; then
  local_release_branch_exists=true
elif [[ `git branch -a --list origin/$RELEASE_BRANCH` ]]; then
  remote_release_branch_exists=true
fi

MAIN_PATH=frontend/src/main.js

# run
if [[ $run_mode = run ]]; then
  # 最新のdevelopブランチ取得
  git fetch
  if "$is_develop"; then
    git checkout develop
  fi
  git pull

  RELEASE_BRANCH=release/$version
  # リリースブランチ作成済みの場合は弾く
  if "$local_release_branch_exists"; then
    echo "$RELEASE_BRANCH はローカル上に作成済みです"
    exit 1
  elif "$remote_release_branch_exists"; then
    echo "$RELEASE_BRANCH はリモート上に作成済みです"
    exit 1
  fi

  # リリースブランチ作成
  $(git checkout -b $RELEASE_BRANCH)
  sed -i -e "s/v0.0.1/v$version/g" $MAIN_PATH
  git add $MAIN_PATH
  git commit -m "バージョン$version設定"

  git push origin $RELEASE_BRANCH

  # tag作成
  git tag -a v$version -m "version $version"
  git push origin v$version

# dryrun
elif [[ $run_mode = dryrun ]]; then
  message=$'git fetch\n'
  if "$is_develop"; then
    message+=$'git checkout develop\n'
  fi
  message+=$'git pull\n'
  if "$local_release_branch_exists"; then
    message+="$RELEASE_BRANCH はローカル上に作成済みです"
    echo "$message"
    exit 1
  elif "$remote_release_branch_exists"; then
    message+="$RELEASE_BRANCH はリモート上に作成済みです"
    echo "$message"
    exit 1
  fi
  echo "$message"

  message_="git checkout -b $RELEASE_BRANCH
sed -i -e \"s/v0.0.1/v$version/g\" $MAIN_PATH
git add $MAIN_PATH
git commit -m \"v$version 設定\"

git push origin $RELEASE_BRANCH

git tag -a v$version -m \"version $version\"
git push origin v$version
"
  echo "$message_"
else
  usage
fi