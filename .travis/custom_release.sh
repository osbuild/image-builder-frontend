#!/bin/bash
set -ex

if [ "${TRAVIS_BRANCH}" = "main" ]; then
    .travis/release.sh "stage-beta"
fi

if [ "${TRAVIS_BRANCH}" = "stage-stable" ]; then
    .travis/release.sh "stage-stable"
fi

if [ "${TRAVIS_BRANCH}" = "prod-beta" ]; then
    .travis/release.sh "prod-beta"
fi

if [ "${TRAVIS_BRANCH}" = "prod-stable" ]; then
    .travis/release.sh "prod-stable"
fi
