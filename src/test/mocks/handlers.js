import { http, HttpResponse } from 'msw';

import { CREATE_BLUEPRINT, IMAGE_BUILDER_API } from '../../constants';
import {
  mockBlueprintComposes,
  mockBlueprintComposesOutOfSync,
  mockCentosBlueprintComposes,
  mockEmptyBlueprintsComposes,
  mockGetBlueprints,
} from '../fixtures/blueprints';
import { composesEndpoint, mockStatus } from '../fixtures/composes';
import { getMockBlueprintResponse } from '../fixtures/editMode';
import {
  distributionOscapProfiles,
  oscapCustomizations,
  oscapCustomizationsPolicy,
} from '../fixtures/oscap';

export const handlers = [
  http.get(`${IMAGE_BUILDER_API}/composes`, ({ request }) => {
    return HttpResponse.json(composesEndpoint(new URL(request.url)));
  }),
  http.get(`${IMAGE_BUILDER_API}/composes/:composeId`, ({ params }) => {
    const { composeId } = params;
    return HttpResponse.json(mockStatus(composeId));
  }),
  http.post(`${IMAGE_BUILDER_API}/compose`, () => {
    return HttpResponse.json({});
  }),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/profiles`,
    ({ request }) => {
      return HttpResponse.json(distributionOscapProfiles(request));
    },
  ),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:distribution/:profile/customizations`,
    ({ params }) => {
      const { profile } = params;
      return HttpResponse.json(oscapCustomizations(profile));
    },
  ),
  http.get(
    `${IMAGE_BUILDER_API}/oscap/:policy/:distribution/policy_customizations`,
    ({ params }) => {
      const { policy } = params;
      return HttpResponse.json(oscapCustomizationsPolicy(policy));
    },
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
      parseInt(offset) + parseInt(limit),
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
      return new HttpResponse(null, { status: 200 });
    },
  ),
];
