import { screen, waitFor } from '@testing-library/react';

import { mapRequestFromState } from '@/Components/CreateImageWizard/utilities/requestMapper';
import { CreateBlueprintRequest } from '@/store/api/backend';
import { server } from '@/test/mocks/server';
import { createTestStore, createUser, typeWithWait } from '@/test/testUtils';

import {
  removeRepo,
  renderRepositoriesStep,
  selectRepo,
  typeIntoSearchBox,
} from './helpers';
import {
  createDefaultFetchHandler,
  createFetchHandler,
  fetchMock,
  mockRepositoryResults,
} from './mocks';

fetchMock.enableMocks();

vi.mock('@/Utilities/useDebounce', () => ({
  default: <T,>(value: T): T => value,
}));

// Disable global MSW server for this file - we use fetch mocks instead
beforeAll(() => {
  server.close();
});

// Restore global MSW server so other tests don't break
afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('Repositories Component', () => {
  describe('Search Component', () => {
    test('displays search bar and refresh button', async () => {
      renderRepositoriesStep();
      expect(
        await screen.findByRole('textbox', { name: /filter repositories/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear search/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /menu toggle/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /refresh repositories/i }),
      ).toBeInTheDocument();
    });

    test('shows loading state while searching', async () => {
      let resolveSearch!: (value: string) => void;
      const searchPromise = new Promise<string>((resolve) => {
        resolveSearch = resolve;
      });

      fetchMock.mockResponse((req) => {
        if (
          req.url.includes('/repositories') &&
          req.url.includes('search=') &&
          req.method === 'GET'
        ) {
          return searchPromise;
        }
        return createDefaultFetchHandler(req);
      });

      renderRepositoriesStep();
      const user = createUser();
      await typeIntoSearchBox(user, 'abcd');

      expect(
        await screen.findByRole('option', {
          name: /searching repositories/i,
        }),
      ).toBeInTheDocument();

      resolveSearch(JSON.stringify({ data: [], meta: { count: 0 } }));
    });

    test('shows "no results" for failed search', async () => {
      renderRepositoriesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'abcd');

      expect(
        await screen.findByRole('option', {
          name: /No repositories found for "abcd"/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Repositories Table Component', () => {
    test('shows loading spinner while searching for repositories', async () => {
      // Create a promise that won't resolve immediately to keep loading state
      let resolveSearch!: (value: string) => void;
      const searchPromise = new Promise<string>((resolve) => {
        resolveSearch = resolve;
      });

      // Override the default handler to return a pending promise for repositories searches
      fetchMock.mockResponse((req) => {
        if (req.url.endsWith('/repositories') && req.method === 'GET') {
          return searchPromise;
        }
        return createDefaultFetchHandler(req);
      });

      renderRepositoriesStep();

      expect(await screen.findByText(/loading/i)).toBeInTheDocument();

      // Resolve the promise to complete the test
      resolveSearch('');

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
      await screen.findByRole('heading', { name: /No custom repositories/i });
    });

    test('shows default empty state', async () => {
      renderRepositoriesStep();
      expect(
        await screen.findByRole('heading', { name: /no custom repositories/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          /you can add custom repositories to your environment on the content repositories page/i,
        ),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/Add custom repositories/),
      ).toBeInTheDocument();
    });
  });

  describe('Repositories Selection', () => {
    test('selecting a repository adds it to the table', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      renderRepositoriesStep();
      const user = createUser();

      await selectRepo(user, '01-test-valid-repo');

      expect(
        await screen.findByRole('cell', { name: /01-test-valid-repo/i }),
      ).toBeInTheDocument();
    });

    test('selecting a repository again removes it from the table', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      renderRepositoriesStep();
      const user = createUser();

      await selectRepo(user, '01-test-valid-repo');

      expect(
        await screen.findByRole('cell', { name: /01-test-valid-repo/i }),
      ).toBeInTheDocument();

      await selectRepo(user, '01-test-valid-repo');

      await waitFor(() => {
        expect(
          screen.queryByRole('cell', { name: /01-test-valid-repo/i }),
        ).not.toBeInTheDocument();
      });
    });

    test('selecting multiple repositories works', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      renderRepositoriesStep();
      const user = createUser();

      await selectRepo(user, '01-test-valid-repo');
      await selectRepo(user, '04-test-another-valid-repo');

      expect(
        await screen.findByRole('cell', { name: /01-test-valid-repo/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('cell', {
          name: /04-test-another-valid-repo/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Redux State Integration', () => {
    test('selecting a repository updates Redux state with package data', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      const { store } = renderRepositoriesStep();
      const user = createUser();

      expect(
        store.getState().wizard.repositories.customRepositories,
      ).toHaveLength(0);
      expect(
        store.getState().wizard.repositories.payloadRepositories,
      ).toHaveLength(0);

      await selectRepo(user, '01-test-valid-repo');

      const customRepositories =
        store.getState().wizard.repositories.customRepositories;
      expect(customRepositories).toHaveLength(1);
      expect(customRepositories[0].name).toBe('01-test-valid-repo');
      expect(customRepositories[0].id).toBe(
        'ae39f556-6986-478a-95d1-f9c7e33d066c',
      );
      expect(customRepositories[0].baseurl).toStrictEqual([
        'http://valid.link.to.repo.org/x86_64/',
      ]);

      const payloadRepositories =
        store.getState().wizard.repositories.payloadRepositories;
      expect(payloadRepositories).toHaveLength(1);
      expect(payloadRepositories[0].id).toBe(
        'ae39f556-6986-478a-95d1-f9c7e33d066c',
      );
      expect(payloadRepositories[0].baseurl).toBe(
        'http://valid.link.to.repo.org/x86_64/',
      );
    });

    test('deselecting a repository removes it from Redux state', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      const { store } = renderRepositoriesStep();
      const user = createUser();

      await selectRepo(user, '01-test-valid-repo');
      expect(
        store.getState().wizard.repositories.customRepositories,
      ).toHaveLength(1);
      expect(
        store.getState().wizard.repositories.payloadRepositories,
      ).toHaveLength(1);

      await removeRepo(user);
      expect(
        store.getState().wizard.repositories.customRepositories,
      ).toHaveLength(0);
      expect(
        store.getState().wizard.repositories.payloadRepositories,
      ).toHaveLength(0);
    });

    test('selecting multiple repositories updates Redux state correctly', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      const { store } = renderRepositoriesStep();
      const user = createUser();

      await selectRepo(user, '01-test-valid-repo');
      await selectRepo(user, '04-test-another-valid-repo');

      await waitFor(() => {
        const customRepositories =
          store.getState().wizard.repositories.customRepositories;
        expect(customRepositories).toHaveLength(2);
        expect(customRepositories.map((p) => p.name)).toEqual([
          '01-test-valid-repo',
          '04-test-another-valid-repo',
        ]);
      });
      await waitFor(() => {
        const payloadRepositories =
          store.getState().wizard.repositories.payloadRepositories;
        expect(payloadRepositories).toHaveLength(2);
        expect(payloadRepositories.map((p) => p.id)).toEqual([
          'ae39f556-6986-478a-95d1-f9c7e33d066c',
          '34718648-0946-4b09-abef-3a20647f2b1f',
        ]);
      });
    });

    test('preloaded repositories state persists', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      const user = createUser();
      const { store } = renderRepositoriesStep({
        repositories: {
          customRepositories: [
            {
              name: '01-test-valid-repo',
              id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
              baseurl: ['http://valid.link.to.repo.org/x86_64/'],
            },
            {
              name: '04-test-another-valid-repo',
              id: '34718648-0946-4b09-abef-3a20647f2b1f',
              baseurl: ['http://also.valid.link.to.repo.org/x86_64/'],
            },
          ],
          payloadRepositories: [
            {
              id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
              baseurl: 'http://valid.link.to.repo.org/x86_64/',
              rhsm: false,
            },
            {
              id: '34718648-0946-4b09-abef-3a20647f2b1f',
              baseurl: 'http://also.valid.link.to.repo.org/x86_64/',
              rhsm: false,
            },
          ],
          redHatRepositories: [],
          recommendedRepositories: [],
        },
      });

      await selectRepo(user, '05-test-very-valid-repo');

      expect(
        store.getState().wizard.repositories.customRepositories,
      ).toHaveLength(3);
      expect(
        store.getState().wizard.repositories.payloadRepositories,
      ).toHaveLength(3);

      expect(
        await screen.findByRole('cell', { name: /01-test-valid-repo/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('cell', {
          name: /04-test-another-valid-repo/i,
        }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('cell', {
          name: /05-test-very-valid-repo/i,
        }),
      ).toBeInTheDocument();
    });
  });
});

const createStoreWithRepositoriesState = (wizardStateOverrides = {}) => {
  return createTestStore({
    imageTypes: ['guest-image'],
    registration: {
      registrationType: 'register-later',
      activationKey: undefined,
      orgId: undefined,
      satelliteRegistration: {
        command: undefined,
        caCert: undefined,
      },
    },
    ...wizardStateOverrides,
  });
};

const MOCK_ORG_ID = '5';

describe('Request Payload Generation', () => {
  test('generates correct custom_repositories from state', () => {
    const store = createStoreWithRepositoriesState({
      repositories: {
        customRepositories: [
          {
            name: '01-test-valid-repo',
            id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
            baseurl: ['http://valid.link.to.repo.org/x86_64/'],
            check_gpg: true,
            check_repo_gpg: false,
            gpgkey: [
              '-----BEGIN PGP PUBLIC KEY BLOCK-----\ntest-key\n-----END PGP PUBLIC KEY BLOCK-----',
            ],
          },
        ],
        payloadRepositories: [
          {
            id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
            baseurl: 'http://valid.link.to.repo.org/x86_64/',
            rhsm: false,
            check_gpg: true,
            check_repo_gpg: false,
            gpgkey:
              '-----BEGIN PGP PUBLIC KEY BLOCK-----\ntest-key\n-----END PGP PUBLIC KEY BLOCK-----',
          },
        ],
        redHatRepositories: [],
        recommendedRepositories: [],
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.custom_repositories).toHaveLength(1);
    expect(request.customizations.custom_repositories![0]).toEqual({
      name: '01-test-valid-repo',
      id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
      baseurl: ['http://valid.link.to.repo.org/x86_64/'],
      check_gpg: true,
      check_repo_gpg: false,
      gpgkey: [
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\ntest-key\n-----END PGP PUBLIC KEY BLOCK-----',
      ],
    });
  });

  test('generates correct payload_repositories from state', () => {
    const store = createStoreWithRepositoriesState({
      repositories: {
        customRepositories: [
          {
            name: '01-test-valid-repo',
            id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
            baseurl: ['http://valid.link.to.repo.org/x86_64/'],
          },
        ],
        payloadRepositories: [
          {
            id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
            baseurl: 'http://valid.link.to.repo.org/x86_64/',
            rhsm: false,
            check_gpg: true,
            check_repo_gpg: false,
            gpgkey:
              '-----BEGIN PGP PUBLIC KEY BLOCK-----\ntest-key\n-----END PGP PUBLIC KEY BLOCK-----',
          },
        ],
        redHatRepositories: [],
        recommendedRepositories: [],
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.payload_repositories).toHaveLength(1);
    expect(request.customizations.payload_repositories![0]).toEqual({
      id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
      baseurl: 'http://valid.link.to.repo.org/x86_64/',
      rhsm: false,
      check_gpg: true,
      check_repo_gpg: false,
      gpgkey:
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\ntest-key\n-----END PGP PUBLIC KEY BLOCK-----',
    });
  });

  test('module_hotfixes is correctly mapped in payload', () => {
    const store = createStoreWithRepositoriesState({
      repositories: {
        customRepositories: [
          {
            name: 'nginx-repo',
            id: 'f087f9ad-dfe6-4627-9d53-447d1a997de5',
            baseurl: ['http://nginx.org/packages/centos/9/x86_64/'],
            module_hotfixes: true,
            check_gpg: true,
            check_repo_gpg: false,
          },
        ],
        payloadRepositories: [
          {
            id: 'f087f9ad-dfe6-4627-9d53-447d1a997de5',
            baseurl: 'http://nginx.org/packages/centos/9/x86_64/',
            rhsm: false,
            module_hotfixes: true,
            check_gpg: true,
            check_repo_gpg: false,
          },
        ],
        redHatRepositories: [],
        recommendedRepositories: [],
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.custom_repositories![0].module_hotfixes).toBe(
      true,
    );
    expect(
      request.customizations.payload_repositories![0].module_hotfixes,
    ).toBe(true);
  });

  test('empty repositories returns undefined in payload', () => {
    const store = createStoreWithRepositoriesState({
      repositories: {
        customRepositories: [],
        payloadRepositories: [],
        redHatRepositories: [],
        recommendedRepositories: [],
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.custom_repositories).toBeUndefined();
    expect(request.customizations.payload_repositories).toBeUndefined();
  });

  test('empty baseurl array is converted to undefined in payload', () => {
    const store = createStoreWithRepositoriesState({
      repositories: {
        customRepositories: [
          {
            name: 'repo-with-empty-baseurl',
            id: '12345678-1234-1234-1234-123456789012',
            baseurl: [],
          },
        ],
        payloadRepositories: [
          {
            id: '12345678-1234-1234-1234-123456789012',
            baseurl: '',
            rhsm: false,
          },
        ],
        redHatRepositories: [],
        recommendedRepositories: [],
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(
      request.customizations.custom_repositories![0].baseurl,
    ).toBeUndefined();
  });

  test('multiple repositories are correctly mapped', () => {
    const store = createStoreWithRepositoriesState({
      repositories: {
        customRepositories: [
          {
            name: '01-test-valid-repo',
            id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
            baseurl: ['http://valid.link.to.repo.org/x86_64/'],
          },
          {
            name: '04-test-another-valid-repo',
            id: '34718648-0946-4b09-abef-3a20647f2b1f',
            baseurl: ['http://also.valid.link.to.repo.org/x86_64/'],
          },
        ],
        payloadRepositories: [
          {
            id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
            baseurl: 'http://valid.link.to.repo.org/x86_64/',
            rhsm: false,
          },
          {
            id: '34718648-0946-4b09-abef-3a20647f2b1f',
            baseurl: 'http://also.valid.link.to.repo.org/x86_64/',
            rhsm: false,
          },
        ],
        redHatRepositories: [],
        recommendedRepositories: [],
      },
    });

    const request = mapRequestFromState(
      store,
      MOCK_ORG_ID,
    ) as CreateBlueprintRequest;

    expect(request.customizations.custom_repositories).toHaveLength(2);
    expect(request.customizations.payload_repositories).toHaveLength(2);
    expect(
      request.customizations.custom_repositories!.map((r) => r.name),
    ).toEqual(['01-test-valid-repo', '04-test-another-valid-repo']);
    expect(
      request.customizations.payload_repositories!.map((r) => r.id),
    ).toEqual([
      'ae39f556-6986-478a-95d1-f9c7e33d066c',
      '34718648-0946-4b09-abef-3a20647f2b1f',
    ]);
  });

  describe('Form submission', () => {
    test('pressing Enter in search input does not trigger page reload', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ repositories: mockRepositoryResults }),
      );
      renderRepositoriesStep();
      const user = createUser();

      const searchInput = await screen.findByRole('textbox', {
        name: /filter repositories/i,
      });
      await typeWithWait(user, searchInput, 'test-repo{Enter}');

      expect(
        screen.getByRole('button', { name: /menu toggle/i }),
      ).toBeInTheDocument();
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('test-repo');
    });
  });
});
