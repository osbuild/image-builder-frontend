#!/bin/bash

export TZ=UTC IS_ON_PREMISE=true

vitest run -t 'renders on-premise table without Version column' \
       src/Components/ImagesTable/tests/ImagesTable.test.tsx

