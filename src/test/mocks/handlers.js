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
  mockClones,
  mockCloneStatus,
  mockComposes,
  mockStatus,
} from '../fixtures/composes';
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

export const handlers = [
  rest.get(`${PROVISIONING_SOURCES_ENDPOINT}`, (req, res, ctx) => {
    const provider = req.url.searchParams.get('provider');
    return res(ctx.status(200), ctx.json(mockSourcesByProvider(provider)));
  }),
  rest.get(
    `${PROVISIONING_SOURCES_ENDPOINT}/:accountId/account_identity`,
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
    `${PROVISIONING_SOURCES_ENDPOINT}/:sourceId/upload_info`,
    (req, res, ctx) => {
      const { sourceId } = req.params;
      if (sourceId === '666' || sourceId === '667') {
        return res(ctx.status(200), ctx.json(mockUploadInfo(sourceId)));
      } else {
        return res(ctx.status(404));
      }
    }
  ),
  rest.post(`${CONTENT_SOURCES}/rpms/names`, async (req, res, ctx) => {
    const { search } = await req.json();
    return res(ctx.status(200), ctx.json(mockSourcesPackagesResults(search)));
  }),
  rest.get(`${IMAGE_BUILDER_API}/packages`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search');
    return res(ctx.status(200), ctx.json(mockPackagesResults(search)));
  }),
  rest.get(`${IMAGE_BUILDER_API}/architectures/:distro`, (req, res, ctx) => {
    const { distro } = req.params;
    return res(ctx.status(200), ctx.json(mockArchitecturesByDistro(distro)));
  }),
  rest.get(`${RHSM_API}/activation_keys`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockActivationKeysResults()));
  }),
  rest.get(`${RHSM_API}/activation_keys/:key`, (req, res, ctx) => {
    const { key } = req.params;
    return res(ctx.status(200), ctx.json(mockActivationKeyInformation(key)));
  }),
  rest.get(`${CONTENT_SOURCES}/repositories/`, (req, res, ctx) => {
    const available_for_arch = req.url.searchParams.get('available_for_arch');
    const available_for_version = req.url.searchParams.get(
      'available_for_version'
    );
    const limit = req.url.searchParams.get('limit');
    const args = { available_for_arch, available_for_version, limit };
    return res(ctx.status(200), ctx.json(mockRepositoryResults(args)));
  }),
  rest.get(`${IMAGE_BUILDER_API}/composes`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockComposes));
  }),
  rest.get(`${IMAGE_BUILDER_API}/composes/:composeId`, (req, res, ctx) => {
    const { composeId } = req.params;
    return res(ctx.status(200), ctx.json(mockStatus[composeId]));
  }),
  rest.get(
    `${IMAGE_BUILDER_API}/composes/:composeId/clones`,
    (req, res, ctx) => {
      const { composeId } = req.params;
      return res(ctx.status(200), ctx.json(mockClones(composeId)));
    }
  ),
  rest.get(`${IMAGE_BUILDER_API}/clones/:cloneId`, (req, res, ctx) => {
    const { cloneId } = req.params;
    return res(ctx.status(200), ctx.json(mockCloneStatus[cloneId]));
  }),
];
