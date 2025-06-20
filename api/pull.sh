#!/bin/bash

# Download the most up-to-date schema files and overwrite the existing ones
curl https://raw.githubusercontent.com/osbuild/image-builder/main/internal/v1/api.yaml -o ./api/schema/imageBuilder.yaml
curl https://console.redhat.com/api/rhsm/v2/openapi.json -o ./api/schema/rhsm.json
curl https://console.redhat.com/api/content-sources/v1/openapi.json -o ./api/schema/contentSources.json
curl https://console.redhat.com/api/provisioning/v1/openapi.json -o ./api/schema/provisioning.json
curl https://console.redhat.com/api/edge/v1/openapi.json -o ./api/schema/edge.json
curl https://console.redhat.com/api/compliance/v2/openapi.json -o ./api/schema/compliance.json
curl https://raw.githubusercontent.com/osbuild/osbuild-composer/main/internal/cloudapi/v2/openapi.v2.yml -o ./api/schema/composerCloudApi.v2.yaml
