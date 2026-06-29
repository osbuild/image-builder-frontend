// This is a common fixture for the customizations tests
import { mergeTests } from '@playwright/test';

import { test as ariaHiddenTest } from './ariaHiddenWorkaround';
import { blockAnalyticsTest } from './blockAnalytics';
import { test as cleanupTest } from './cleanup';
import { test as coverageTest } from './coverage';
import { test as popupTest } from './popupHandler';

// Combine the fixtures into one
export const test = mergeTests(
  ariaHiddenTest,
  blockAnalyticsTest,
  cleanupTest,
  coverageTest,
  popupTest,
);
