#!/bin/bash

case $1 in
  watch) WATCH=true
esac

SOURCE=pages/react-src/todo.js
TRANSPILED=pages/react-bld/todo-transpiled.js
BUNDLED=pages/react-bld/todo-bundled.js

build() {
    babel $SOURCE --out-file $TRANSPILED
    browserify $TRANSPILED > $BUNDLED
}

watch() {
    trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

    echo Starting babel...
    babel $SOURCE --watch --out-file $TRANSPILED &
    BABELPID=$!

    echo Starting watchify...
    watchify $TRANSPILED -o $BUNDLED &
    WATCHIFYPID=$!

    echo Waiting...
    wait $BABELPID $WATCHIFYPID
}

[ -z $WATCH ] && build || watch
