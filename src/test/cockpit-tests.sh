#!/bin/bash

export TZ=UTC IS_ON_PREMISE=true

vitest run -t 'Images Table render ImagesTable' \
       src/test/Components/ImagesTable/ImagesTable.test.tsx

vitest run -t 'Create Image Wizard renders component' \
       src/test/Components/CreateImageWizard/CreateImageWizard.test.tsx
