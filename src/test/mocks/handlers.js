import { http, HttpResponse } from 'msw';

import {
  COMPLIANCE_API,
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
  mockBlueprintComposesOutOfSync,
  mockCentosBlueprintComposes,
  mockEmptyBlueprintsComposes,
  mockGetBlueprints,
} from '../fixtures/blueprints';
import { mockPolicies } from '../fixtures/compliance';
import {
  composesEndpoint,
  mockClones,
  mockCloneStatus,
  mockStatus,
} from '../fixtures/composes';
import { getMockBlueprintResponse } from '../fixtures/editMode';
import { mockedFeatureResponse } from '../fixtures/features';
import {
  distributionOscapProfiles,
  oscapCustomizations,
  oscapCustomizationsPolicy,
} from '../fixtures/oscap';
import {
  mockPkgRecommendations,
  mockSourcesPackagesResults,
  mockSourcesGroupsResults,
} from '../fixtures/packages';
import {
  mockPopularRepo,
  mockRepositoryParameters,
  mockRepositoryResults,
} from '../fixtures/repositories';
import { mockSourcesByProvider, mockUploadInfo } from '../fixtures/sources';
import { mockTemplateResults, testingTemplates } from '../fixtures/templates';

export const handlers = [
  http.get(`${PROVISIONING_API}/sources`, ({ request }) => {
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider');
    return HttpResponse.json(mockSourcesByProvider(provider));
  }),
  http.get(
    `${PROVISIONING_API}/sources/:sourceId/upload_info`,
    ({ params }) => {
      const { sourceId } = params;
      if (sourceId === '666' || sourceId === '667' || sourceId === '123') {
        return HttpResponse.json(mockUploadInfo(sourceId));
      } else {
        return new HttpResponse(null, { status: 404 });
      }
    }
  ),
  http.post(`${CONTENT_SOURCES_API}/rpms/names`, async ({ request }) => {
    const { search, urls } = await request.json();
    return HttpResponse.json(mockSourcesPackagesResults(search, urls));
  }),
  http.post(
    `${CONTENT_SOURCES_API}/package_groups/names`,
    async ({ request }) => {
      const { search, urls } = await request.json();
      return HttpResponse.json(mockSourcesGroupsResults(search, urls));
    }
  ),
  http.get(`${CONTENT_SOURCES_API}/features/`, async () => {
    return HttpResponse.json(mockedFeatureResponse);
  }),
  http.post(`${CONTENT_SOURCES_API}/snapshots/for_date/`, async () => {
    return HttpResponse.json(mockSourcesPackagesResults);
  }),
  http.get(`${IMAGE_BUILDER_API}/packages`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    return HttpResponse.json(mockSourcesPackagesResults(search));
  }),
  http.get(`${IMAGE_BUILDER_API}/architectures/:distro`, ({ params }) => {
    const { distro } = params;
    return HttpResponse.json(mockArchitecturesByDistro(distro));
  }),
  http.get(`${RHSM_API}/activation_keys`, () => {
    return HttpResponse.json(mockActivationKeysResults());
  }),
  http.get(`${RHSM_API}/activation_keys/:key`, ({ params }) => {
    const { key } = params;
    return HttpResponse.json(mockActivationKeyInformation(key));
  }),
  http.get(`${CONTENT_SOURCES_API}/repositories/`, ({ request }) => {
    const url = new URL(request.url);
    const available_for_arch = url.searchParams.get('available_for_arch');
    const available_for_version = url.searchParams.get('available_for_version');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const search = url.searchParams.get('search');
    const uuid = url.searchParams.get('uuid');
    const args = {
      available_for_arch,
      available_for_version,
      limit,
      offset,
      search,
      uuid,
    };
    return HttpResponse.json(mockRepositoryResults(args));
  }),
  http.get(`${CONTENT_SOURCES_API}/templates/`, ({ request }) => {
    const url = new URL(request.url);
    const arch = url.searchParams.get('arch');
    const version = url.searchParams.get('version');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');
    const args = {
      arch,
      version,
      limit,
      offset,
    };
    return HttpResponse.json(mockTemplateResults(args));
  }),
  http.get(`${CONTENT_SOURCES_API}/templates/:uuid`, ({ params }) => {
    const { uuid } = params;
    return HttpResponse.json(testingTemplates[uuid]);
  }),
  http.get(`${CONTENT_SOURCES_API}/repositories/:repo_id`, ({ params }) => {
    const { repo_id } = params;
    return HttpResponse.json(mockPopularRepo(repo_id));
  }),
  http.get(`${CONTENT_SOURCES_API}/repository_parameters`, () => {
    return HttpResponse.json(mockRepositoryParameters());
  }),
  http.get(`${IMAGE_BUILDER_API}/composes`, ({ request }) => {
    return HttpResponse.json(composesEndpoint(new URL(request.url)));
  }),
  http.get(`${IMAGE_BUILDER_API}/composes/:composeId`, ({ params }) => {
    const { composeId } = params;
    return HttpResponse.json(mockStatus(composeId));
  }),
  http.get(`${IMAGE_BUILDER_API}/composes/:composeId/clones`, ({ params }) => {
    const { composeId } = params;
    return HttpResponse.json(mockClones(composeId));
  }),
  http.get(`${IMAGE_BUILDER_API}/clones/:cloneId`, ({ params }) => {
    const { cloneId } = params;
    return HttpResponse.json(mockCloneStatus[cloneId]);
  }),
  http.post(`${IMAGE_BUILDER_API}/compose`, () => {
    return HttpResponse.json({});
  }),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/profiles`,
    ({ request }) => {
      return HttpResponse.json(distributionOscapProfiles(request));
    }
  ),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/:profile/customizations`,
    ({ params }) => {
      const { profile } = params;
      return HttpResponse.json(oscapCustomizations(profile));
    }
  ),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:policy/:distribution/policy_customizations`,
    ({ params }) => {
      const { policy } = params;
      return HttpResponse.json(oscapCustomizationsPolicy(policy));
    }
  ),
  http.get(`${IMAGE_BUILDER_API}/blueprints`, ({ request }) => {
    const url = new URL(request.url);
    const nameParam = url.searchParams.get('name');
    const search = url.searchParams.get('search');
    const limit = url.searchParams.get('limit') || '10';
    const offset = url.searchParams.get('offset') || '0';
    const resp = Object.assign({}, mockGetBlueprints);
    if (nameParam) {
      resp.data = resp.data.filter(({ name }) => {
        return nameParam === name;
      });
    } else if (search) {
      let regexp;
      try {
        regexp = new RegExp(search);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regexp = new RegExp(sanitized);
      }
      resp.data = resp.data.filter(({ name }) => {
        return regexp.test(name);
      });
    }
    resp.meta.count = resp.data.length;
    resp.data = resp.data.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    return HttpResponse.json(resp);
  }),
  http.post(`${IMAGE_BUILDER_API}/blueprint/:id/compose`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post(CREATE_BLUEPRINT, () => {
    const response = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };
    return HttpResponse.json(response);
  }),
  http.get(`${IMAGE_BUILDER_API}/blueprints/:id/composes`, ({ params }) => {
    const { id } = params;
    const emptyBlueprintId = mockGetBlueprints.data[1].id;
    const outOfSyncBlueprintId = mockGetBlueprints.data[3].id;
    const centosBlueprintId = mockGetBlueprints.data[4].id;

    switch (id) {
      case emptyBlueprintId:
        return HttpResponse.json(mockEmptyBlueprintsComposes);
      case outOfSyncBlueprintId:
        return HttpResponse.json(mockBlueprintComposesOutOfSync);
      case centosBlueprintId:
        return HttpResponse.json(mockCentosBlueprintComposes);
      default:
        return HttpResponse.json(mockBlueprintComposes);
    }
  }),
  http.get(`${IMAGE_BUILDER_API}/blueprints/:id`, ({ params }) => {
    const id = params['id'];
    return HttpResponse.json(getMockBlueprintResponse(id));
  }),
  http.put(`${IMAGE_BUILDER_API}/blueprints/:id`, ({ params }) => {
    const id = params['id'];
    return HttpResponse.json({ id: id });
  }),
  http.post(
    `${IMAGE_BUILDER_API}/experimental/blueprints/:id/fixup`,
    ({ params }) => {
      const id = params['id'];
      getMockBlueprintResponse(id).lint.errors = [];
      return HttpResponse(null, { status: 200 });
    }
  ),
  http.post(`${IMAGE_BUILDER_API}/experimental/recommendations`, () => {
    return HttpResponse.json(mockPkgRecommendations);
  }),
  http.get(`${COMPLIANCE_API}/policies`, () => {
    return HttpResponse.json(mockPolicies);
  }),
  http.get(`${COMPLIANCE_API}/policies/:id`, ({ params }) => {
    const id = params['id'];
    for (const p of mockPolicies.data) {
      if (p.id === id) {
        return HttpResponse.json({ data: p });
      }
    }
    return HttpResponse.error();
  }),
];
