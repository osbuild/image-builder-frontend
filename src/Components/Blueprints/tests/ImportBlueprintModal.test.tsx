import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { server } from '@/test/mocks/server';
import { renderWithRedux } from '@/test/testUtils';

import {
  createBlueprintJson,
  createFetchHandler,
  existingRepo,
  fetchMock,
  importedNewRepo,
  newRepoUrl,
} from './mocks';

import { ImportBlueprintModal } from '../ImportBlueprintModal';

fetchMock.enableMocks();

const mockAddNotification = vi.fn();
vi.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => mockAddNotification,
  }),
);

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createFetchHandler());
  mockAddNotification.mockClear();
  // The component calls console.error when listRepositories fails.
  // The global test setup throws on console.error, so we suppress it here.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.resetMocks();
  vi.restoreAllMocks();
});

const renderModal = () => {
  const setShowImportModal = vi.fn();
  return renderWithRedux(
    <ImportBlueprintModal setShowImportModal={setShowImportModal} isOpen />,
  );
};

const uploadBlueprintFile = async (content: string) => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    document.querySelector('input[type="file"]');

  if (!fileInput) {
    throw new Error('File input not found');
  }

  const file = new File([content], 'blueprint.json', {
    type: 'application/json',
  });
  await waitFor(() => user.upload(fileInput, file));
};

describe('ImportBlueprintModal repository import', () => {
  test('does not import repos when checkbox is unchecked', async () => {
    const user = userEvent.setup();

    fetchMock.mockResponse(
      createFetchHandler({
        list: { repositories: [] },
        bulkImport: { response: [] },
      }),
    );

    renderModal();

    // Uncheck the "import repositories" checkbox
    const checkbox = screen.getByRole('checkbox', {
      name: /import custom repositories/i,
    });
    await user.click(checkbox);

    await uploadBlueprintFile(
      createBlueprintJson([{ url: newRepoUrl, name: 'brand-new-repo' }]),
    );

    // Wait for the blueprint to be parsed
    const reviewButton = await screen.findByRole('button', {
      name: /review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());

    // No repository-related notifications should fire
    expect(mockAddNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('repositories'),
      }),
    );

    // No repository API calls should have been made
    const repoCalls = fetchMock.mock.calls.filter(([url]) =>
      typeof url === 'string' ? url.includes('/repositories') : false,
    );
    expect(repoCalls).toHaveLength(0);
  });

  test('imports all repos when none already exist', async () => {
    fetchMock.mockResponse(
      createFetchHandler({
        list: { repositories: [] },
        bulkImport: { response: [importedNewRepo] },
      }),
    );

    renderModal();
    await uploadBlueprintFile(
      createBlueprintJson([{ url: newRepoUrl, name: 'brand-new-repo' }]),
    );

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Successfully imported custom repositories',
        }),
      );
    });

    // Should NOT show "already exist" notification
    expect(mockAddNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom repositories already exist',
      }),
    );
  });

  test('skips import when all repos already exist', async () => {
    fetchMock.mockResponse(
      createFetchHandler({
        list: { repositories: [existingRepo] },
      }),
    );

    renderModal();
    await uploadBlueprintFile(
      createBlueprintJson([{ url: existingRepo.url! }]),
    );

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Custom repositories already exist',
        }),
      );
    });

    // Should NOT show a successful import notification (no bulk import happened)
    expect(mockAddNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Successfully imported custom repositories',
      }),
    );
  });

  test('imports only new repos when some already exist', async () => {
    fetchMock.mockResponse(
      createFetchHandler({
        list: { repositories: [existingRepo] },
        bulkImport: { response: [importedNewRepo] },
      }),
    );

    renderModal();
    await uploadBlueprintFile(
      createBlueprintJson([
        { url: existingRepo.url! },
        { url: newRepoUrl, name: 'brand-new-repo' },
      ]),
    );

    // Should show "already exist" notification for the existing repo
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Custom repositories already exist',
          description: existingRepo.url,
        }),
      );
    });

    // Should also show success notification for the newly imported repo
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Successfully imported custom repositories',
        }),
      );
    });
  });

  test('falls through to import all when listRepositories fails', async () => {
    const repoUrl = 'http://some.repo.example.com/x86_64/';
    const importedRepo = {
      uuid: 'imported-uuid',
      url: repoUrl,
      name: 'some-repo',
      warnings: [],
    };

    fetchMock.mockResponse(
      createFetchHandler({
        list: { shouldFail: true },
        bulkImport: { response: [importedRepo] },
      }),
    );

    renderModal();
    await uploadBlueprintFile(
      createBlueprintJson([{ url: repoUrl, name: 'some-repo' }]),
    );

    // Should import successfully despite list failure
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Successfully imported custom repositories',
        }),
      );
    });

    // Should have logged the error
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(
      'Failed to look up existing repositories:',
      expect.anything(),
    );
  });

  test('returns early when content_sources have no URLs', async () => {
    renderModal();
    await uploadBlueprintFile(
      JSON.stringify({
        name: 'test-blueprint',
        description: 'Test',
        distribution: 'rhel-9',
        customizations: { packages: [] },
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'guest-image',
            upload_request: { type: 'aws.s3', options: {} },
          },
        ],
        content_sources: [{ name: 'no-url-repo' }],
      }),
    );

    // Wait for the blueprint to be parsed — the Review button should become enabled
    const reviewButton = await screen.findByRole('button', {
      name: /review and finish/i,
    });
    await waitFor(() => expect(reviewButton).toBeEnabled());

    // No repository-related notifications should fire
    expect(mockAddNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('repositories'),
      }),
    );
  });

  test('returns existing repos when bulk import fails', async () => {
    fetchMock.mockResponse(
      createFetchHandler({
        list: { repositories: [existingRepo] },
        bulkImport: { shouldFail: true },
      }),
    );

    renderModal();
    await uploadBlueprintFile(
      createBlueprintJson([
        { url: existingRepo.url! },
        { url: newRepoUrl, name: 'brand-new-repo' },
      ]),
    );

    // Should show "already exist" notification
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Custom repositories already exist',
        }),
      );
    });

    // Should show import failure notification
    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Custom repositories import failed',
        }),
      );
    });
  });
});
