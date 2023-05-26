import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import api from '../../../api.js';
import { mockState } from '../../fixtures/composes.js';
import { renderWithReduxRouter } from '../../testUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

const composeId = '1579d95b-8f1d-4982-8c53-8c2afa4ab04c';

describe('Create Share To Regions Modal', () => {
  const user = userEvent.setup();
  test('validation', async () => {
    renderWithReduxRouter(`share/${composeId}`, mockState);

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled();

    let invalidAlert = screen.queryByText(
      /select at least one region to share to\./i
    );
    expect(invalidAlert).not.toBeInTheDocument();

    const selectToggle = screen.getByRole('button', { name: /options menu/i });
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => user.click(selectToggle));

    const usEast2 = screen.getByRole('option', {
      name: /us-east-2 us east \(ohio\)/i,
    });
    expect(usEast2).not.toHaveClass('pf-m-disabled');
    await user.click(usEast2);
    expect(shareButton).toBeEnabled();

    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    clearAllButton.click();
    expect(shareButton).toBeDisabled();

    invalidAlert = screen.getByText(
      /select at least one region to share to\./i
    );
    expect(invalidAlert).toBeInTheDocument();
  });

  test('cancel button redirects to landing page', async () => {
    const { router } = renderWithReduxRouter(`share/${composeId}`, mockState);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    // returns back to the landing page
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/insights/image-builder')
    );
  });

  test('close button redirects to landing page', async () => {
    const { router } = renderWithReduxRouter(`share/${composeId}`, mockState);

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();

    // returns back to the landing page
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/insights/image-builder')
    );
  });

  test('select options disabled correctly based on status and region', async () => {
    renderWithReduxRouter(`share/${composeId}`, mockState);

    const selectToggle = screen.getByRole('button', { name: /options menu/i });
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => userEvent.click(selectToggle));

    // parent region disabled
    const usEast1 = screen.getByRole('option', {
      name: /us-east-1 us east \(n. virginia\)/i,
    });
    expect(usEast1).toHaveClass('pf-m-disabled');

    // successful clone disabled
    const usWest1 = screen.getByRole('option', {
      name: /us-west-1 us west \(n. california\)/i,
    });
    expect(usWest1).toHaveClass('pf-m-disabled');

    // unsuccessful clone enabled
    const usWest2 = screen.getByRole('option', {
      name: /us-west-2 us west \(oregon\)/i,
    });
    expect(usWest2).not.toHaveClass('pf-m-disabled');

    // successful clone with different share_with_accounts than its parent enabled
    const euCentral1 = screen.getByRole('option', {
      name: /eu-central-1 europe \(frankfurt\)/i,
    });
    expect(euCentral1).not.toHaveClass('pf-m-disabled');

    // close the select again to avoid state update
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => userEvent.click(selectToggle));
  });

  test('cloning an image results in successful store updates', async () => {
    const { router, store } = renderWithReduxRouter(
      `share/${composeId}`,
      mockState
    );

    const selectToggle = screen.getByRole('button', { name: /options menu/i });
    await user.click(selectToggle);

    const usEast2 = screen.getByRole('option', {
      name: /us-east-2 us east \(ohio\)/i,
    });
    expect(usEast2).not.toHaveClass('pf-m-disabled');
    await user.click(usEast2);

    const mockResponse = {
      id: '123e4567-e89b-12d3-a456-426655440000',
    };
    const cloneImage = jest.spyOn(api, 'cloneImage').mockImplementation(() => {
      return Promise.resolve(mockResponse);
    });

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeEnabled();
    await act(async () => shareButton.click());

    expect(cloneImage).toHaveBeenCalledTimes(1);

    // returns back to the landing page
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/insights/image-builder')
    );

    // Clone has been added to its parent's list of clones
    expect(
      store.getState().composes.byId['1579d95b-8f1d-4982-8c53-8c2afa4ab04c']
        .clones
    ).toEqual([
      'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
      '48fce414-0cc0-4a16-8645-e3f0edec3212',
      '0169538e-515c-477e-b934-f12783939313',
      '4a851db1-919f-43ca-a7ef-dd209877a77e',
      '123e4567-e89b-12d3-a456-426655440000',
    ]);

    // Clone has been added to state.clones.allIds
    expect(store.getState().clones.allIds).toEqual([
      'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
      '48fce414-0cc0-4a16-8645-e3f0edec3212',
      '0169538e-515c-477e-b934-f12783939313',
      '4a851db1-919f-43ca-a7ef-dd209877a77e',
      '123e4567-e89b-12d3-a456-426655440000',
    ]);

    // Clone has been added to state.clones.byId
    expect(
      store.getState().clones.byId['123e4567-e89b-12d3-a456-426655440000']
    ).toEqual({
      id: '123e4567-e89b-12d3-a456-426655440000',
      image_status: {
        status: 'pending',
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      request: {
        region: 'us-east-2',
        share_with_accounts: ['123123123123'],
      },
    });
  });
});
