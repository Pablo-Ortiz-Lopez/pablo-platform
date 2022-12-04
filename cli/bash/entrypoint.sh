#!/bin/bash

cd /cli/node

# CLI_DEV -> Specify if you want to run cli JS code from your local code instead of the one pre-bundled on the docker image
if [ "$CLI_DEV" = "1" ];then 
    # install dependencies
    echo -e "\e[1;31m CLI DEV MODE \e[0m"
    yarn
fi

export NODE_NO_WARNINGS=1

npx babel-node --experimental-modules --es-module-specifier-resolution=node -- src/index.js $@