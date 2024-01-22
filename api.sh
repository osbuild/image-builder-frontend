#!/bin/bash

# Download the most up-to-date imageBuilder.yaml file and overwrite the existing one
curl https://raw.githubusercontent.com/osbuild/image-builder/main/internal/v1/api.yaml -o ./api/schema/imageBuilder.yaml

# Run commands in the background using & operator
npx @rtk-query/codegen-openapi ./api/config/imageBuilder.ts &
npx @rtk-query/codegen-openapi ./api/config/rhsm.ts &
npx @rtk-query/codegen-openapi ./api/config/contentSources.ts &
npx @rtk-query/codegen-openapi ./api/config/provisioning.ts &
npx @rtk-query/codegen-openapi ./api/config/edge.ts &

# Wait for all background jobs to finish
wait

