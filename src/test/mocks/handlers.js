import { rest } from 'msw';

import {
  CONTENT_SOURCES,
  IMAGE_BUILDER_API,
  PROVISIONING_SOURCES_ENDPOINT,
  RHSM_API,
} from '../../constants';
import {
  mockActivationKeyInformation,
  mockActivationKeysResults,
} from '../fixtures/activationKeys';
import { mockArchitecturesByDistro } from '../fixtures/architectures';
import {
  mockPackagesResults,
  mockSourcesPackagesResults,
} from '../fixtures/packages';
import { mockRepositoryResults } from '../fixtures/repositories';
import {
  mockAccountIdentity,
  mockSourcesByProvider,
  mockUploadInfo,
} from '../fixtures/sources';

const baseURL = 'http://localhost';

export const handlers = [
  rest.get(
    baseURL.concat(`${PROVISIONING_SOURCES_ENDPOINT}`),
    (req, res, ctx) => {
      const provider = req.url.searchParams.get('provider');
      return res(ctx.status(200), ctx.json(mockSourcesByProvider(provider)));
    }
  ),
  rest.get(
    baseURL.concat(
      `${PROVISIONING_SOURCES_ENDPOINT}/:accountId/account_identity`
    ),
    (req, res, ctx) => {
      const { accountId } = req.params;
      if (accountId === '123') {
        return res(ctx.status(200), ctx.json(mockAccountIdentity));
      } else {
        return res(ctx.status(404));
      }
    }
  ),
  rest.get(
    baseURL.concat(`${PROVISIONING_SOURCES_ENDPOINT}/:sourceId/upload_info`),
    (req, res, ctx) => {
      const { sourceId } = req.params;
      if (sourceId === '666' || sourceId === '667') {
        return res(ctx.status(200), ctx.json(mockUploadInfo(sourceId)));
      } else {
        return res(ctx.status(404));
      }
    }
  ),
  rest.post(
    baseURL.concat(`${CONTENT_SOURCES}/rpms/names`),
    async (req, res, ctx) => {
      const { search } = await req.json();
      return res(ctx.status(200), ctx.json(mockSourcesPackagesResults(search)));
    }
  ),
  rest.get(baseURL.concat(`${IMAGE_BUILDER_API}/packages`), (req, res, ctx) => {
    const search = req.url.searchParams.get('search');
    return res(ctx.status(200), ctx.json(mockPackagesResults(search)));
  }),
  rest.get(
    baseURL.concat(`${IMAGE_BUILDER_API}/architectures/:distro`),
    (req, res, ctx) => {
      const { distro } = req.params;
      return res(ctx.status(200), ctx.json(mockArchitecturesByDistro(distro)));
    }
  ),
  rest.get(baseURL.concat(`${RHSM_API}/activation_keys`), (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockActivationKeysResults()));
  }),
  rest.get(
    baseURL.concat(`${RHSM_API}/activation_keys/:key`),
    (req, res, ctx) => {
      const { key } = req.params;
      return res(ctx.status(200), ctx.json(mockActivationKeyInformation(key)));
    }
  ),
  rest.get(
    baseURL.concat(`${CONTENT_SOURCES}/repositories/`),
    (req, res, ctx) => {
      const available_for_arch = req.url.searchParams.get('available_for_arch');
      const available_for_version = req.url.searchParams.get(
        'available_for_version'
      );
      const limit = req.url.searchParams.get('limit');
      const args = { available_for_arch, available_for_version, limit };
      return res(ctx.status(200), ctx.json(mockRepositoryResults(args)));
    }
  ),
];
