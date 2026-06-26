#!/bin/bash

export TZ=UTC IS_ON_PREMISE=true

vitest run -t 'Images Table render ImagesTable' \
       src/test/Components/ImagesTable/ImagesTable.test.tsx

