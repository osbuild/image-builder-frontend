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

export const getBlueprintIdByName = async (
  page: Page,
  blueprintName: string,
): Promise<string> => {
  const response = await callApi(
    `/api/image-builder/v1/blueprints?search=${encodeURIComponent(blueprintName)}`,
    page,
  );
  const body = await response.json();
  if (!body?.data) {
    throw new Error(
      `Unexpected API response for blueprint search: ${JSON.stringify(body)}`,
    );
  }
  if (!Array.isArray(body.data)) {
    throw new Error(
      `Unexpected API response for blueprint search: "data" is not an array: ${JSON.stringify(body)}`,
    );
  }
  type Blueprint = { id: string; name: string };
  const blueprint = body.data.find(
    (bp: Blueprint) => bp.name === blueprintName,
  );
  if (!blueprint) {
    throw new Error(`Blueprint "${blueprintName}" not found`);
  }
  return blueprint.id;
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

type RepositoryRequest = {
  name: string;
  url: string;
  snapshot?: boolean;
  distribution_arch?: string;
  distribution_versions?: string[];
};

type RepositoryResponse = {
  uuid: string;
  name: string;
  url: string;
};

export const createRepositoryViaApi = async (
  page: Page,
  repository: RepositoryRequest,
): Promise<RepositoryResponse> => {
  const headers = await getAuthHeaders(page);
  const response = await page
    .context()
    .request.post('/api/content-sources/v1/repositories/', {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      data: repository,
    });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(
      `Failed to create repository, status: ${response.status()}, body: ${body}`,
    );
  }

  return response.json();
};

export const deleteRepositoryViaApi = async (
  page: Page,
  uuid: string,
): Promise<void> => {
  const headers = await getAuthHeaders(page);
  const response = await page
    .context()
    .request.delete(`/api/content-sources/v1/repositories/${uuid}`, {
      headers,
    });

  if (response.status() !== 204 && response.status() !== 404) {
    throw new Error(
      `Failed to delete repository ${uuid}, status: ${response.status()}`,
    );
  }
};

// Polls the content-sources API until the repository appears in search
// results. Call this after creating a repo to give the backend time to
// index it before the UI tries to find it.
export const waitUntilRepositoryIsSearchable = async (
  page: Page,
  repositoryName: string,
  { intervalMs = 2_000, timeoutMs = 30_000 } = {},
): Promise<void> => {
  const headers = await getAuthHeaders(page);
  const endpoint = `/api/content-sources/v1/repositories/?search=${encodeURIComponent(repositoryName)}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await page.context().request.get(endpoint, { headers });

    if (response.status() === 200) {
      const body = await response.json();
      const found = body.data?.some(
        (repo: { name: string }) => repo.name === repositoryName,
      );
      if (found) {
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Repository "${repositoryName}" was not searchable after ${timeoutMs}ms`,
  );
};

export const deleteRepositoryByUrlViaApi = async (
  page: Page,
  url: string,
): Promise<void> => {
  const headers = await getAuthHeaders(page);
  const response = await page
    .context()
    .request.get(
      `/api/content-sources/v1/repositories/?url=${encodeURIComponent(url)}`,
      { headers },
    );

  if (response.status() !== 200) {
    return;
  }

  const body = await response.json();
  if (body.data && body.data.length > 0) {
    await deleteRepositoryViaApi(page, body.data[0].uuid);
  }
};
