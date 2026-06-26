import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { server } from '@/test/mocks/server';
import { clickWithWait } from '@/test/testUtils';

import {
  expectInvalidFormatError,
  expectReviewButtonDisabled,
  expectReviewButtonEnabled,
  renderImportModal,
  uploadBlueprintFile,
} from './helpers';
import {
  BLUEPRINT_JSON,
  BLUEPRINT_WITH_DISK_CUSTOMIZATION,
  BLUEPRINT_WITH_FILESYSTEM_CUSTOMIZATION,
  createBlueprintJson,
  createFetchHandler,
  existingRepo,
  fetchMock,
  IGNORE_SUBSCRIPTION_BLUEPRINT,
  importedNewRepo,
  INVALID_ARCHITECTURE_JSON,
  INVALID_BLUEPRINT_WITH_FILESYSTEM_AND_DISK,
  INVALID_JSON,
  MALFORMED_TOML,
  newRepoUrl,
  ONPREM_BLUEPRINT_TOML,
  ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES,
} from './mocks';

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
});

afterEach(() => {
  fetchMock.resetMocks();
  vi.restoreAllMocks();
});

describe('ImportBlueprintModal repository import', () => {
  test('does not import repos when checkbox is unchecked', async () => {
    const user = userEvent.setup();

    fetchMock.mockResponse(
      createFetchHandler({
        list: { repositories: [] },
        bulkImport: { response: [] },
      }),
    );

    renderImportModal();

    // Uncheck the "import repositories" checkbox
    const checkbox = screen.getByRole('checkbox', {
      name: /import custom repositories/i,
    });
    await clickWithWait(user, checkbox);

    await uploadBlueprintFile(
      'blueprint.json',
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

    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
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

    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
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

    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
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
    vi.spyOn(console, 'error').mockImplementation(() => {});

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

    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
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
    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
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

    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
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

describe('ImportBlueprintModal blueprint parsing', () => {
  test('shows alert on invalid JSON', async () => {
    renderImportModal();
    await uploadBlueprintFile('blueprint.json', INVALID_JSON);

    await expectReviewButtonDisabled();
    await expectInvalidFormatError();
  });

  test('shows alert on invalid architecture', async () => {
    renderImportModal();
    await uploadBlueprintFile('blueprint.json', INVALID_ARCHITECTURE_JSON);

    await expectReviewButtonDisabled();
    await expectInvalidFormatError();
  });

  test('shows error and keeps review disabled on malformed TOML blueprint', async () => {
    renderImportModal();
    await uploadBlueprintFile('blueprint.toml', MALFORMED_TOML);

    await expectReviewButtonDisabled();
    await expectInvalidFormatError();
  });

  test('enables button and ignores subscription in blueprint', async () => {
    renderImportModal();
    await uploadBlueprintFile('blueprint.json', IGNORE_SUBSCRIPTION_BLUEPRINT);

    await expectReviewButtonEnabled();
  });

  test('enables button on valid JSON blueprint', async () => {
    renderImportModal();
    await uploadBlueprintFile('blueprint.json', BLUEPRINT_JSON);

    await expectReviewButtonEnabled();
  });

  test('enables button on valid TOML blueprint', async () => {
    renderImportModal();
    await uploadBlueprintFile('blueprint.toml', ONPREM_BLUEPRINT_TOML);

    await expectReviewButtonEnabled();

    const warningText = await screen.findByText(
      /Importing on-premises blueprints is currently in beta/i,
    );
    expect(warningText).toBeInTheDocument();
  });

  test('enables button on TOML blueprint with invalid values', async () => {
    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.toml',
      ONPREM_BLUEPRINT_TOML_WITH_INVALID_VALUES,
    );

    await expectReviewButtonEnabled();

    const warningText = await screen.findByText(
      /Importing on-premises blueprints is currently in beta/i,
    );
    expect(warningText).toBeInTheDocument();
  });
});

describe('ImportBlueprintModal partitioning', () => {
  test('imports blueprint with filesystem customization', async () => {
    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
      BLUEPRINT_WITH_FILESYSTEM_CUSTOMIZATION,
    );

    await expectReviewButtonEnabled();
  });

  test('imports blueprint with disk customization', async () => {
    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
      BLUEPRINT_WITH_DISK_CUSTOMIZATION,
    );

    await expectReviewButtonEnabled();
  });

  test('rejects blueprint with both filesystem and disk customizations', async () => {
    renderImportModal();
    await uploadBlueprintFile(
      'blueprint.json',
      INVALID_BLUEPRINT_WITH_FILESYSTEM_AND_DISK,
    );

    await expectReviewButtonDisabled();
    await expectInvalidFormatError();
  });
});
