#!/bin/bash

find -name "cockpit" -type d
find -name "cockpit" -type d | xargs rm -rf -

setNpmOrYarn
install
build
if [ "$IS_PR" == true ]; then
    verify
else
    export BETA=false
    build
    source build_app_info.sh
    mv ${DIST_FOLDER} stable
    export BETA=true
    build
    source build_app_info.sh
    mv ${DIST_FOLDER} preview
    mkdir -p ${DIST_FOLDER}
    mv stable ${DIST_FOLDER}/stable
    mv preview ${DIST_FOLDER}/preview
fi
