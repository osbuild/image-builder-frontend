import { rest } from 'msw';

import {
  CONTENT_SOURCES_API,
  IMAGE_BUILDER_API,
  PROVISIONING_API,
  RHSM_API,
} from '../../constants';
import {
  mockActivationKeyInformation,
  mockActivationKeysResults,
} from '../fixtures/activationKeys';
import { mockArchitecturesByDistro } from '../fixtures/architectures';
import {
  composesEndpoint,
  mockClones,
  mockCloneStatus,
  mockStatus,
} from '../fixtures/composes';
import {
  distributionOscapProfiles,
  oscapCustomizations,
} from '../fixtures/oscap';
import {
  mockPackagesResults,
  mockSourcesPackagesResults,
} from '../fixtures/packages';
import { mockRepositoryResults } from '../fixtures/repositories';
import { mockSourcesByProvider, mockUploadInfo } from '../fixtures/sources';

export const handlers = [
  rest.get(`${PROVISIONING_API}/sources`, (req, res, ctx) => {
    const provider = req.url.searchParams.get('provider');
    return res(ctx.status(200), ctx.json(mockSourcesByProvider(provider)));
  }),
  rest.get(
    `${PROVISIONING_API}/sources/:sourceId/upload_info`,
    (req, res, ctx) => {
      const { sourceId } = req.params;
      if (sourceId === '666' || sourceId === '667' || sourceId === '123') {
        return res(ctx.status(200), ctx.json(mockUploadInfo(sourceId)));
      } else {
        return res(ctx.status(404));
      }
    }
  ),
  rest.post(`${CONTENT_SOURCES_API}/rpms/names`, async (req, res, ctx) => {
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
  rest.get(`${CONTENT_SOURCES_API}/repositories/`, (req, res, ctx) => {
    const available_for_arch = req.url.searchParams.get('available_for_arch');
    const available_for_version = req.url.searchParams.get(
      'available_for_version'
    );
    const limit = req.url.searchParams.get('limit');
    const offset = req.url.searchParams.get('offset');
    const args = { available_for_arch, available_for_version, limit, offset };
    return res(ctx.status(200), ctx.json(mockRepositoryResults(args)));
  }),
  rest.get(`${IMAGE_BUILDER_API}/composes`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(composesEndpoint(req)));
  }),
  rest.get(`${IMAGE_BUILDER_API}/composes/:composeId`, (req, res, ctx) => {
    const { composeId } = req.params;
    return res(ctx.status(200), ctx.json(mockStatus(composeId)));
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
    return res(ctx.status(200), ctx.json(mockCloneStatus(cloneId)));
  }),
  rest.post(`${IMAGE_BUILDER_API}/compose`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/profiles`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(distributionOscapProfiles(req)));
    }
  ),
  rest.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/:profile/customizations`,
    (req, res, ctx) => {
      const { profile } = req.params;
      return res(ctx.status(200), ctx.json(oscapCustomizations(profile)));
    }
  ),
];
