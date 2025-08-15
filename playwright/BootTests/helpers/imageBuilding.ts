import { Page } from '@playwright/test';

export const buildImage = async (page: Page) => {
  /**
   * Build the image and wait for it to be ready.
   * @param page - the page object
   */
  await page.getByRole('button', { name: 'Build images' }).click();
  let timeSpentBuilding = 0;
  console.log('Starting the build');
  // eslint-disable-next-line disable-autofix/@typescript-eslint/no-unnecessary-condition
  while (true) {
    if (
      (await page.getByText('Ready').isVisible()) ||
      (await page.getByText('Expires in').isVisible())
    ) {
      console.log(`Image is ready (Time spent: ${timeSpentBuilding / 60000}m)`);
      break;
    } else if (await page.getByText('Image build failed').isVisible()) {
      throw new Error('Image build failed');
    }
    await new Promise((resolve) => setTimeout(resolve, 30000));
    // Show how much time passed since the build started
    timeSpentBuilding += 30000;
    if (timeSpentBuilding % (60000 * 5) === 0) {
      // Log only every 5 minutes
      console.log(
        `Waiting for image to be ready (Time spent: ${timeSpentBuilding / 60000}m)`,
      );
    }
  }
};

export const downloadImage = async (page: Page, filePath: string) => {
  /**
   * Download the image and save it to the specified path.
   * @param page - the page object
   * @param filePath - the path to save the image
   */
  // Start waiting for download before clicking. Note no await.
  console.log('Downloading image');
  const downloadPromise = page.waitForEvent('download');
  await page.getByText('Download').first().click();
  const download = await downloadPromise;
  await download.saveAs(filePath);
  console.log(`Downloaded file: ${filePath}`);
};

export const constructFilePath = (blueprintName: string, extension: string) => {
  /**
   * Construct the file path for the image.
   * @param blueprintName - the name of the blueprint
   * @param extension - the extension of the image
   */
  return `./image-downloads/${blueprintName}.${extension}`;
};
