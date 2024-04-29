import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import {
  CreateBlueprintRequest,
  CustomRepository,
  Repository,
} from '../../../../../store/imageBuilderApi';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  renderCreateMode,
} from '../../wizardTestUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
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

const goToRepositoriesStep = async () => {
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await userEvent.click(guestImageCheckBox);
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
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectFirstRepository = async () => {
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 0/i })
  );
};

const deselectFirstRepository = async () => {
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 0/i })
  );
};

const selectNginxRepository = async () => {
  const search = await screen.findByLabelText('Search repositories');
  await userEvent.type(search, 'nginx stable repo');
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 0/i })
  );
};

describe('repositories request generated correctly', () => {
  const expectedPayloadRepositories: Repository[] = [
    {
      baseurl: 'http://valid.link.to.repo.org/x86_64/',
      check_gpg: true,
      check_repo_gpg: false,
      gpgkey:
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
      rhsm: false,
    },
  ];

  const expectedCustomRepositories: CustomRepository[] = [
    {
      baseurl: ['http://valid.link.to.repo.org/x86_64/'],
      check_gpg: true,
      check_repo_gpg: false,
      gpgkey: [
        '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
      ],
      id: 'ae39f556-6986-478a-95d1-f9c7e33d066c',
      name: '01-test-valid-repo',
    },
  ];

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

  test('with custom repositories', async () => {
    await renderCreateMode();
    await goToRepositoriesStep();
    await selectFirstRepository();
    await goToReviewStep();
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

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
