#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# name of app-sre "application" folder this component lives in; needs to match for quay
export COMPONENT_NAME="image-builder-frontend"
# IMAGE should match the quay repo set by app.yaml in app-interface
export IMAGE="quay.io/cloudservices/image-builder-frontend"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)
#16 is the default Node version. Change this to override it.
export NODE_BUILD_VERSION=20
# skip unit tests on frontend-build
export SKIP_VERIFY=True
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master

# --------------------------------------------
# Options that must be configured by app owner
# --------------------------------------------
export IQE_PLUGINS="image-builder"
export IQE_CJI_TIMEOUT="90m"
export IQE_MARKER_EXPRESSION="fe_pr_check"
export IQE_SELENIUM="true"
export IQE_ENV="ephemeral"
export IQE_IMAGE_TAG="image-builder"
export IQE_PARALLEL_ENABLED="false"
export RESERVE_DURATION="2h"

# bootstrap bonfire and it's config
CICD_URL=https://raw.githubusercontent.com/RedHatInsights/bonfire/master/cicd
curl -s "$CICD_URL"/bootstrap.sh >.cicd_bootstrap.sh && source .cicd_bootstrap.sh

# # source is preferred to | bash -s in this case to avoid a subshell
source <(curl -sSL $COMMON_BUILDER/src/frontend-build.sh)

# reserve ephemeral namespace
export DEPLOY_FRONTENDS="true"
export EXTRA_DEPLOY_ARGS="provisioning sources rhsm-api-proxy --set-template-ref rhsm-api-proxy=master"
export APP_NAME="image-builder-crc"
export DEPLOY_TIMEOUT="1200"
export REF_ENV="insights-stage"
# overwrites any resource limits imposed by bonfire
export COMPONENTS_W_RESOURCES="compliance notifications-backend notifications-engine"

source "$CICD_ROOT"/deploy_ephemeral_env.sh

# Run smoke tests using a ClowdJobInvocation (preferred)
# The contents of this script can be found at:
# https://raw.githubusercontent.com/RedHatInsights/bonfire/master/cicd/cji_smoke_test.sh
export COMPONENT_NAME="image-builder"
source "$CICD_ROOT"/cji_smoke_test.sh

# Post a comment with test run IDs to the PR
# The contents of this script can be found at:
# https://raw.githubusercontent.com/RedHatInsights/bonfire/master/cicd/post_test_results.sh
source "$CICD_ROOT"/post_test_results.sh
