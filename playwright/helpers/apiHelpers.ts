import { APIResponse, Page } from '@playwright/test';

/**
 * Call API and return the response
 * @param endpoint - The endpoint to call
 * @param page - The page object
 * @param method - The HTTP method to use
 * @returns The response from the API as APIResponse object
 */
export const callApi = async (
  endpoint: string,
  page: Page,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
): Promise<APIResponse> => {
  const header = await getAuthHeaders(page);
  const response = await page
    .context()
    .request[method](endpoint, { headers: header });
  return response;
};

/**
 * Checks if a service is available by sending GET request to endpoint belonging to the service.
 * @param endpoint - The endpoint to check the status of
 * @param page - The page object
 * @returns True if the service is available, false otherwise
 */
export const isServiceAvailable = async (
  endpoint: string,
  page: Page,
): Promise<boolean> => {
  const header = await getAuthHeaders(page);
  const response = await page
    .context()
    .request.get(endpoint, { headers: header });
  return response.status() >= 200 && response.status() < 300;
};

/**
 * Extract Authorization header from browser cookies
 * @param page - Playwright Page object
 * @returns Headers object with Authorization if cs_jwt cookie is found
 */
export const getAuthHeaders = async (
  page: Page,
): Promise<Record<string, string>> => {
  const cookies = await page.context().cookies();
  const jwtCookie = cookies.find((c) => c.name === 'cs_jwt');
  if (jwtCookie) {
    return { Authorization: `Bearer ${jwtCookie.value}` };
  }
  return {};
};
