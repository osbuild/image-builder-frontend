import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  CustomRepository,
  Repository,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  expectedCustomRepositories,
  expectedPayloadRepositories,
  repositoriesCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    auth: {
      getUser: () => {
        return {
          identity: {
            internal: {
              org_id: 5,
            },
          },
        };
      },
    },
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) =>
    flag === 'image-builder.firstboot.enabled' ? true : false
  ),
}));

const goToRepositoriesStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext(); // Snapshot
  await clickNext(); // Custom repositories
};

const goToReviewStep = async () => {
  await clickNext(); // Additional packages
  await clickNext();
  await clickNext(); // First Boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectFirstRepository = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const deselectFirstRepository = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const clickBulkSelect = async () => {
  const user = userEvent.setup();
  const bulkSelectCheckbox = await screen.findByRole('checkbox', {
    name: /select all/i,
  });
  await waitFor(async () => user.click(bulkSelectCheckbox));
};

describe('repositories request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('with custom repositories', async () => {
    await renderCreateMode();
    await goToRepositoriesStep();
    await selectFirstRepository();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: expectedCustomRepositories,
        payload_repositories: expectedPayloadRepositories,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  const selectNginxRepository = async () => {
    const user = userEvent.setup();
    const search = await screen.findByLabelText('Search repositories');
    await waitFor(() => user.type(search, 'nginx stable repo'));
    await waitFor(
      () => expect(screen.getByText('nginx stable repo')).toBeInTheDocument
    );
    await selectFirstRepository();
  };

  const expectedNginxRepository: Repository = {
    baseurl: 'http://nginx.org/packages/centos/9/x86_64/',
    module_hotfixes: true,
    check_gpg: true,
    check_repo_gpg: false,
    gpgkey:
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v2.0.22 (GNU/Linux)\n\nmQENBE5OMmIBCAD+FPYKGriGGf7NqwKfWC83cBV01gabgVWQmZbMcFzeW+hMsgxH\nW6iimD0RsfZ9oEbfJCPG0CRSZ7ppq5pKamYs2+EJ8Q2ysOFHHwpGrA2C8zyNAs4I\nQxnZZIbETgcSwFtDun0XiqPwPZgyuXVm9PAbLZRbfBzm8wR/3SWygqZBBLdQk5TE\nfDR+Eny/M1RVR4xClECONF9UBB2ejFdI1LD45APbP2hsN/piFByU1t7yK2gpFyRt\n97WzGHn9MV5/TL7AmRPM4pcr3JacmtCnxXeCZ8nLqedoSuHFuhwyDnlAbu8I16O5\nXRrfzhrHRJFM1JnIiGmzZi6zBvH0ItfyX6ttABEBAAG0KW5naW54IHNpZ25pbmcg\na2V5IDxzaWduaW5nLWtleUBuZ2lueC5jb20+iQE+BBMBAgAoAhsDBgsJCAcDAgYV\nCAIJCgsEFgIDAQIeAQIXgAUCV2K1+AUJGB4fQQAKCRCr9b2Ce9m/YloaB/9XGrol\nkocm7l/tsVjaBQCteXKuwsm4XhCuAQ6YAwA1L1UheGOG/aa2xJvrXE8X32tgcTjr\nKoYoXWcdxaFjlXGTt6jV85qRguUzvMOxxSEM2Dn115etN9piPl0Zz+4rkx8+2vJG\nF+eMlruPXg/zd88NvyLq5gGHEsFRBMVufYmHtNfcp4okC1klWiRIRSdp4QY1wdrN\n1O+/oCTl8Bzy6hcHjLIq3aoumcLxMjtBoclc/5OTioLDwSDfVx7rWyfRhcBzVbwD\noe/PD08AoAA6fxXvWjSxy+dGhEaXoTHjkCbz/l6NxrK3JFyauDgU4K4MytsZ1HDi\nMgMW8hZXxszoICTTiQEcBBABAgAGBQJOTkelAAoJEKZP1bF62zmo79oH/1XDb29S\nYtWp+MTJTPFEwlWRiyRuDXy3wBd/BpwBRIWfWzMs1gnCjNjk0EVBVGa2grvy9Jtx\nJKMd6l/PWXVucSt+U/+GO8rBkw14SdhqxaS2l14v6gyMeUrSbY3XfToGfwHC4sa/\nThn8X4jFaQ2XN5dAIzJGU1s5JA0tjEzUwCnmrKmyMlXZaoQVrmORGjCuH0I0aAFk\nRS0UtnB9HPpxhGVbs24xXZQnZDNbUQeulFxS4uP3OLDBAeCHl+v4t/uotIad8v6J\nSO93vc1evIje6lguE81HHmJn9noxPItvOvSMb2yPsE8mH4cJHRTFNSEhPW6ghmlf\nWa9ZwiVX5igxcvaIRgQQEQIABgUCTk5b0gAKCRDs8OkLLBcgg1G+AKCnacLb/+W6\ncflirUIExgZdUJqoogCeNPVwXiHEIVqithAM1pdY/gcaQZmIRgQQEQIABgUCTk5f\nYQAKCRCpN2E5pSTFPnNWAJ9gUozyiS+9jf2rJvqmJSeWuCgVRwCcCUFhXRCpQO2Y\nVa3l3WuB+rgKjsQ=\n=EWWI\n-----END PGP PUBLIC KEY BLOCK-----',
    rhsm: false,
  };

  const expectedNginxCustomRepository: CustomRepository = {
    baseurl: ['http://nginx.org/packages/centos/9/x86_64/'],
    module_hotfixes: true,
    check_gpg: true,
    check_repo_gpg: false,
    gpgkey: [
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v2.0.22 (GNU/Linux)\n\nmQENBE5OMmIBCAD+FPYKGriGGf7NqwKfWC83cBV01gabgVWQmZbMcFzeW+hMsgxH\nW6iimD0RsfZ9oEbfJCPG0CRSZ7ppq5pKamYs2+EJ8Q2ysOFHHwpGrA2C8zyNAs4I\nQxnZZIbETgcSwFtDun0XiqPwPZgyuXVm9PAbLZRbfBzm8wR/3SWygqZBBLdQk5TE\nfDR+Eny/M1RVR4xClECONF9UBB2ejFdI1LD45APbP2hsN/piFByU1t7yK2gpFyRt\n97WzGHn9MV5/TL7AmRPM4pcr3JacmtCnxXeCZ8nLqedoSuHFuhwyDnlAbu8I16O5\nXRrfzhrHRJFM1JnIiGmzZi6zBvH0ItfyX6ttABEBAAG0KW5naW54IHNpZ25pbmcg\na2V5IDxzaWduaW5nLWtleUBuZ2lueC5jb20+iQE+BBMBAgAoAhsDBgsJCAcDAgYV\nCAIJCgsEFgIDAQIeAQIXgAUCV2K1+AUJGB4fQQAKCRCr9b2Ce9m/YloaB/9XGrol\nkocm7l/tsVjaBQCteXKuwsm4XhCuAQ6YAwA1L1UheGOG/aa2xJvrXE8X32tgcTjr\nKoYoXWcdxaFjlXGTt6jV85qRguUzvMOxxSEM2Dn115etN9piPl0Zz+4rkx8+2vJG\nF+eMlruPXg/zd88NvyLq5gGHEsFRBMVufYmHtNfcp4okC1klWiRIRSdp4QY1wdrN\n1O+/oCTl8Bzy6hcHjLIq3aoumcLxMjtBoclc/5OTioLDwSDfVx7rWyfRhcBzVbwD\noe/PD08AoAA6fxXvWjSxy+dGhEaXoTHjkCbz/l6NxrK3JFyauDgU4K4MytsZ1HDi\nMgMW8hZXxszoICTTiQEcBBABAgAGBQJOTkelAAoJEKZP1bF62zmo79oH/1XDb29S\nYtWp+MTJTPFEwlWRiyRuDXy3wBd/BpwBRIWfWzMs1gnCjNjk0EVBVGa2grvy9Jtx\nJKMd6l/PWXVucSt+U/+GO8rBkw14SdhqxaS2l14v6gyMeUrSbY3XfToGfwHC4sa/\nThn8X4jFaQ2XN5dAIzJGU1s5JA0tjEzUwCnmrKmyMlXZaoQVrmORGjCuH0I0aAFk\nRS0UtnB9HPpxhGVbs24xXZQnZDNbUQeulFxS4uP3OLDBAeCHl+v4t/uotIad8v6J\nSO93vc1evIje6lguE81HHmJn9noxPItvOvSMb2yPsE8mH4cJHRTFNSEhPW6ghmlf\nWa9ZwiVX5igxcvaIRgQQEQIABgUCTk5b0gAKCRDs8OkLLBcgg1G+AKCnacLb/+W6\ncflirUIExgZdUJqoogCeNPVwXiHEIVqithAM1pdY/gcaQZmIRgQQEQIABgUCTk5f\nYQAKCRCpN2E5pSTFPnNWAJ9gUozyiS+9jf2rJvqmJSeWuCgVRwCcCUFhXRCpQO2Y\nVa3l3WuB+rgKjsQ=\n=EWWI\n-----END PGP PUBLIC KEY BLOCK-----',
    ],
    id: 'f087f9ad-dfe6-4627-9d53-447d1a997de5',
    name: 'nginx stable repo',
  };

  test('with custom repository with module_hotfixes', async () => {
    await renderCreateMode();
    await goToRepositoriesStep();
    await selectNginxRepository();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: [expectedNginxCustomRepository],
        payload_repositories: [expectedNginxRepository],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('deselecting a custom repository removes it from the request', async () => {
    await renderCreateMode();
    await goToRepositoriesStep();
    await selectFirstRepository();
    await deselectFirstRepository();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('bulk select', async () => {
    await renderCreateMode();
    await goToRepositoriesStep();
    await clickBulkSelect();
    await goToReviewStep();
    const receivedRequest = (await interceptBlueprintRequest(
      CREATE_BLUEPRINT
    )) as CreateBlueprintRequest;
    expect(receivedRequest.customizations.custom_repositories).toHaveLength(6);
    expect(receivedRequest.customizations.payload_repositories).toHaveLength(6);
  });
});

describe('Repositories edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //  const user = userEvent.setup();
  test('edit mode works', async () => {
    const id = mockBlueprintIds['repositories'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = repositoriesCreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
  //  test(
  //    'modal pops up when deselecting previously used repository',
  //    { retry: 3 },
  //    async () => {
  //      const id = mockBlueprintIds['repositories'];
  //      await renderEditMode(id);
  //
  //      const customRepositories = await screen.findByRole('button', {
  //        name: /Custom repositories/,
  //      });
  //
  //      user.click(customRepositories);
  //
  //      await screen.findByText(
  //        /Removing previously added repositories may lead to issues with selected packages/i
  //      );
  //
  //      const selectedRepositories = await screen.findByRole('button', {
  //        name: /Selected repositories/,
  //      });
  //      user.click(selectedRepositories);
  //
  //      const repoCheckbox = await screen.findByRole('checkbox', {
  //        name: /select row 0/i,
  //      });
  //      await waitFor(() => expect(repoCheckbox).toBeChecked());
  //
  //      user.click(repoCheckbox);
  //      await screen.findByText(/Are you sure?/);
  //      const removeAnywayBtn = await screen.findByRole('button', {
  //        name: /Remove anyway/,
  //      });
  //      user.click(removeAnywayBtn);
  //
  //      await waitFor(() =>
  //        expect(screen.queryByText(/Are you sure?/)).not.toBeInTheDocument()
  //      );
  //
  //      await waitFor(() => expect(repoCheckbox).not.toBeChecked());
  //    }
  //  );
});
