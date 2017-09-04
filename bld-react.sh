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
    babel $SOURCE --watch --out-file $TRANSPILED &
    watchify $TRANSPILED -o $BUNDLED &
    wait
}

[ -z $WATCH ] && build || watch
