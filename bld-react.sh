#!/bin/bash
babel pages/react-src/todo.js --out-file pages/react-bld/todo-transpiled.js
browserify pages/react-bld/todo-transpiled.js > pages/react-bld/todo-bundled.js
