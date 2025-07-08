import { test as base } from '@playwright/test';

import { closePopupsIfExist } from '../helpers/helpers';

export interface PopupHandlerFixture {
  popupHandler: void;
}

// This fixture will close any popups that might get opened during the test execution
export const test = base.extend<PopupHandlerFixture>({
  popupHandler: [
    async ({ page }, use) => {
      await closePopupsIfExist(page);
      await use(undefined);
    },
    { auto: true },
  ],
});
