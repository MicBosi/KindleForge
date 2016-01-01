#!/bin/sh
set -e
cd ./static/js
browserify init.js -o bundle.js
