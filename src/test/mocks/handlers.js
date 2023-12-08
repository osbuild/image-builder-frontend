import { HttpResponse, http } from 'msw';

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
        return new HttpResponse(null, {
          status: 404,
        });
      }
    }
  ),
  http.post(`${CONTENT_SOURCES_API}/rpms/names`, async ({ request }) => {
    const { search } = await request.json();
    return HttpResponse.json(mockSourcesPackagesResults(search));
  }),
  http.get(`${IMAGE_BUILDER_API}/packages`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    return HttpResponse.json(mockPackagesResults(search));
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
    const args = { available_for_arch, available_for_version, limit, offset };
    return HttpResponse.json(mockRepositoryResults(args));
  }),
  http.get(`${IMAGE_BUILDER_API}/composes`, ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json(composesEndpoint(url));
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
    return HttpResponse.json(mockCloneStatus(cloneId));
  }),
  http.post(`${IMAGE_BUILDER_API}/compose`, () => {
    return HttpResponse.json({});
  }),
  http.get(`${IMAGE_BUILDER_API}/oscap/:distribution/profiles`, () => {
    return HttpResponse.json(distributionOscapProfiles());
  }),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/:profile/customizations`,
    ({ params }) => {
      const { profile } = params;
      return HttpResponse.json(oscapCustomizations(profile));
    }
  ),
];
