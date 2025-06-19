// This is a common fixture for the customizations tests
import { mergeTests } from '@playwright/test';

import { test as cleanupTest } from './cleanup';
import { test as popupTest } from './popupHandler';

// Combine the fixtures into one
export const test = mergeTests(cleanupTest, popupTest);
