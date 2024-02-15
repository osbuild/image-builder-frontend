import { rest } from 'msw';

import {
  CONTENT_SOURCES_API,
  CREATE_BLUEPRINT,
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
  mockBlueprintComposes,
  mockBlueprintDetail,
  mockEmptyBlueprintsComposes,
  mockGetBlueprints,
} from '../fixtures/blueprints';
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
  rest.get(`${IMAGE_BUILDER_API}/experimental/blueprints`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search');
    const resp = Object.assign({}, mockGetBlueprints);
    if (search) {
      let regexp;
      try {
        regexp = new RegExp(search);
      } catch (e) {
        const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regexp = new RegExp(sanitized);
      }
      resp.data = mockGetBlueprints.data.filter(({ name }) => {
        return regexp.test(name);
      });
      resp.meta.count = resp.data.length;
    }

    return res(ctx.status(200), ctx.json(resp));
  }),
  rest.post(
    `${IMAGE_BUILDER_API}/experimental/blueprint/:id/compose`,
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),
  rest.post(CREATE_BLUEPRINT, (req, res, ctx) => {
    const response = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };
    return res(ctx.status(201), ctx.json(response));
  }),
  rest.get(
    `${IMAGE_BUILDER_API}/experimental/blueprints/:id/composes`,
    (req, res, ctx) => {
      const MilkChocolateBlueprint = mockGetBlueprints.data[1].id;
      if (req.params.id === MilkChocolateBlueprint) {
        return res(ctx.status(200), ctx.json(mockEmptyBlueprintsComposes));
      }
      return res(ctx.status(200), ctx.json(mockBlueprintComposes));
    }
  ),
  rest.get(
    `${IMAGE_BUILDER_API}/experimental/blueprints/:id`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mockBlueprintDetail));
    }
  ),
];
