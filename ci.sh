#!/bin/bash

# Workaround needed for Konflux pipeline to pass

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
    # Export sentry specific variables for the webpack plugin. Note that
    # this only works in jenkins (not konflux). The webpack plugin will
    # both inject debug ids and upload the sourcemaps, in konflux only
    # the debug ids are injected.  As the debug ids are consistend
    # across builds, this works.
    export SENTRY_AUTH_TOKEN
    build
    source build_app_info.sh
    mv ${DIST_FOLDER} preview
    mkdir -p ${DIST_FOLDER}
    mv stable ${DIST_FOLDER}/stable
    mv preview ${DIST_FOLDER}/preview
fi

# End workaround
