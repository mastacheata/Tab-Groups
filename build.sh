#!/bin/sh

rm -r dist/*
cp -r src/background.js src/assets/* dist/
./node_modules/rollup/bin/rollup -c
