#!/bin/bash

# Download the most up-to-date imageBuilder.yaml file and overwrite the existing one
curl https://raw.githubusercontent.com/osbuild/image-builder/main/internal/v1/api.yaml -o ./api/schema/imageBuilder.yaml

curl https://console.redhat.com/api/compliance/v2/openapi.json -o ./api/schema/compliance.json

curl https://console.redhat.com/api/content-sources/v1/openapi.json -o ./api/schema/contentSources.json

curl https://raw.githubusercontent.com/osbuild/osbuild-composer/main/internal/cloudapi/v2/openapi.v2.yml -o ./api/schema/composerCloudApi.v2.yaml
