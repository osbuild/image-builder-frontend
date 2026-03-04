import type { Router as RemixRouter } from '@remix-run/router';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  EDIT_BLUEPRINT,
  IMAGE_BUILDER_API,
  RHEL_10,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  aarch64CreateBlueprintRequest,
  centos9CreateBlueprintRequest,
  rhel8CreateBlueprintRequest,
  rhel9CreateBlueprintRequest,
  x86_64CreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { server } from '../../../../mocks/server';
import {
  interceptEditBlueprintRequest,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

// this is a weird false positive by eslint, the var is being used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let router: RemixRouter | undefined = undefined;

describe('Step Image output', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('alert gets rendered when fetching target environments fails', async () => {
    server.use(
      http.get(`${IMAGE_BUILDER_API}/architectures/${RHEL_10}`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    await renderCreateMode();
    await screen.findByText(/Couldn't fetch target environments/);
  });
});

describe('Image output edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works - rhel9', async () => {
    const id = mockBlueprintIds['rhel9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = rhel9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - rhel8', async () => {
    const id = mockBlueprintIds['rhel8'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = rhel8CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - centos9', async () => {
    const id = mockBlueprintIds['centos9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = centos9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - x86_64', async () => {
    const id = mockBlueprintIds['x86_64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = x86_64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - aarch64', async () => {
    const id = mockBlueprintIds['aarch64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = aarch64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
