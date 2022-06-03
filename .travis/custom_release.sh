#!/bin/bash
set -ex

if [ "${TRAVIS_BRANCH}" = "main" ]; then
    .travis/release.sh "stage-beta"
fi

if [ "${TRAVIS_BRANCH}" = "stage-stable" ]; then
    # Download modified Jenkinsfile
    curl -o .travis/58231b16fdee45a03a4ee3cf94a9f2c3 https://raw.githubusercontent.com/RedHatInsights/image-builder-frontend/stage-stable/.travis/Jenkinsfile
    # Insert stage webhook URL
    sed -i 's|WEBHOOK_PLACEHOLDER|https://smee.io/IQDT9yRXsWlqbxpg|g' .travis/58231b16fdee45a03a4ee3cf94a9f2c3
    .travis/release.sh "stage-stable"
fi

if [ "${TRAVIS_BRANCH}" = "prod-beta" ]; then
    .travis/release.sh "prod-beta"
fi

if [ "${TRAVIS_BRANCH}" = "prod-stable" ]; then
    # Download modified Jenkinsfile
    curl -o .travis/58231b16fdee45a03a4ee3cf94a9f2c3 https://raw.githubusercontent.com/RedHatInsights/image-builder-frontend/stage-stable/.travis/Jenkinsfile
    # Insert prod webhook URL
    sed -i 's|WEBHOOK_PLACEHOLDER|https://smee.io/F9gZwIGELxwah4if|g' .travis/58231b16fdee45a03a4ee3cf94a9f2c3
    .travis/release.sh "prod-stable"
fi
