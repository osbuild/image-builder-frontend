import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { IMAGE_BUILDER_API } from '../../../constants';
import { mockBlueprintIds } from '../../fixtures/blueprints';
import { mockComposesEmpty } from '../../fixtures/composes';
import { server } from '../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

describe('Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page heading', async () => {
    renderCustomRoutesWithReduxRouter();

    // check heading
    const heading = await screen.findByText('Images');
    expect(heading).toHaveRole('heading');
  });

  test('renders EmptyState child component', async () => {
    server.use(
      http.get(`${IMAGE_BUILDER_API}/composes`, () => {
        return HttpResponse.json(mockComposesEmpty);
      }),
    );

    renderCustomRoutesWithReduxRouter();
    // check table loads
    await screen.findByText(
      /Image builder is a tool for creating deployment-ready customized system images/i,
    );
  });
});

describe('Set blueprint using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('no blueprint selected by default (no query parameter)', async () => {
    renderCustomRoutesWithReduxRouter();

    // Verify no blueprint is selected by checking that "All Images" is shown
    // and no blueprint-specific UI elements are present
    await screen.findByText('Images');

    // Check that we don't have blueprint-specific elements like build button
    expect(
      screen.queryByRole('button', { name: /Build images/i }),
    ).not.toBeInTheDocument();
  });

  test('blueprint selected even with invalid ID (current behavior)', async () => {
    renderCustomRoutesWithReduxRouter('/?blueprint=invalid-blueprint-id');

    // Currently, any blueprint ID from URL will be set in Redux state
    // This shows that the URL parameter handling is working
    await screen.findByText('Images');

    // The build button should appear because a blueprint ID is set
    // even if it's invalid - the backend will handle the invalid ID
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeInTheDocument();
  });

  test('blueprint selected (query parameter provided)', async () => {
    const blueprintId = mockBlueprintIds.darkChocolate;
    renderCustomRoutesWithReduxRouter(`/?blueprint=${blueprintId}`);

    // Wait for the blueprint to be selected and verify blueprint-specific UI appears
    const buildImageBtn = await screen.findByRole('button', {
      name: /Build images/i,
    });
    expect(buildImageBtn).toBeInTheDocument();

    // Verify that the images table shows blueprint-specific content
    const table = await screen.findByTestId('images-table');
    expect(table).toBeInTheDocument();

    // The main test is that blueprint-specific UI elements appear
    // This indicates that the URL parameter was processed and the blueprint was selected
    // The presence of the build button confirms blueprint selection is working
    expect(buildImageBtn).toBeEnabled();
  });
});
