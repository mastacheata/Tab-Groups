#!/bin/sh

rm -r dist/*
cp -r src/assets/* dist/
./node_modules/rollup/bin/rollup -c
