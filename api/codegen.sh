#!/bin/bash

# Run commands in the background using & operator
npx @rtk-query/codegen-openapi ./config/imageBuilder.ts &
npx @rtk-query/codegen-openapi ./config/rhsm.ts &
npx @rtk-query/codegen-openapi ./config/contentSources.ts &
npx @rtk-query/codegen-openapi ./config/compliance.ts &
npx @rtk-query/codegen-openapi ./config/composerCloudApi.ts &

# Wait for all background jobs to finish
wait

