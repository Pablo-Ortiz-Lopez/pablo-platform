#!/bin/bash

cd /platform/cli

yarn &>/dev/null

export NODE_NO_WARNINGS=1

npx babel-node --experimental-modules --es-module-specifier-resolution=node -- src/index.js $@