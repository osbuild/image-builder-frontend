#!/bin/bash

# Run commands in the background using & operator
npx @rtk-query/codegen-openapi ./api/config/imageBuilder.ts &
npx @rtk-query/codegen-openapi ./api/config/rhsm.ts &
npx @rtk-query/codegen-openapi ./api/config/contentSources.ts &
npx @rtk-query/codegen-openapi ./api/config/provisioning.ts &
npx @rtk-query/codegen-openapi ./api/config/edge.ts &

# Wait for all background jobs to finish
wait

