import React from 'react';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReduxRouter } from '../../testUtils';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import api from '../../../api.js';
import { RHEL_8 } from '../../../constants.js';

const mockComposes = {
  count: 1,
  allIds: ['1579d95b-8f1d-4982-8c53-8c2afa4ab04c'],
  byId: {
    '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
      id: '1579d95b-8f1d-4982-8c53-8c2afa4abc',
      image_name: 'testImageName',
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      request: {
        distribution: RHEL_8,
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'ami',
            upload_request: {
              type: 'aws',
              options: {
                share_with_accounts: ['123123123123'],
              },
            },
          },
        ],
      },
      clones: [
        'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
        '48fce414-0cc0-4a16-8645-e3f0edec3212',
        '0169538e-515c-477e-b934-f12783939313',
        '4a851db1-919f-43ca-a7ef-dd209877a77e',
      ],
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0217b81d9be50e44b',
            region: 'us-east-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
  },
  error: null,
};

const mockClones = {
  allIds: [
    'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
    '48fce414-0cc0-4a16-8645-e3f0edec3212',
    '0169538e-515c-477e-b934-f12783939313',
    '4a851db1-919f-43ca-a7ef-dd209877a77e',
  ],
  byId: {
    'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d': {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: 'f9133ec4-7a9e-4fd9-9a9f-9636b82b0a5d',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-0e778053cd490ad21',
            region: 'us-west-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
    // Duplicate us-west-1 clone with different ami created one day later
    '48fce414-0cc0-4a16-8645-e3f0edec3212': {
      created_at: '2021-04-28 12:31:12.794809 +0000 UTC',
      id: '48fce414-0cc0-4a16-8645-e3f0edec3212',
      request: {
        region: 'us-west-1',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-9f0asd1tlk2142124',
            region: 'us-west-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
    '0169538e-515c-477e-b934-f12783939313': {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '0169538e-515c-477e-b934-f12783939313',
      request: {
        region: 'us-west-2',
        share_with_accounts: ['123123123123'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'failure',
        upload_status: {
          options: {
            ami: 'ami-9fdskj12fdsak1211',
            region: 'us-west-2',
          },
          status: 'failure',
          type: 'aws',
        },
      },
    },
    '4a851db1-919f-43ca-a7ef-dd209877a77e': {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '4a851db1-919f-43ca-a7ef-dd209877a77e',
      request: {
        region: 'eu-central-1',
        share_with_accounts: ['000000000000'],
      },
      parent: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      image_status: {
        status: 'success',
        upload_status: {
          options: {
            ami: 'ami-9fdskj12fdsak1211',
            region: 'eu-central-1',
          },
          status: 'success',
          type: 'aws',
        },
      },
    },
  },
  error: null,
};

const mockState = {
  clones: { ...mockClones },
  composes: { ...mockComposes },
  notifications: [],
};

const mockLocation = {
  state: {
    composeId: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
  },
};

let view;
let history;
let store;

describe('Create Share To Regions Modal', () => {
  test('validation', async () => {
    renderWithReduxRouter(<ShareImageModal />, mockState, mockLocation);

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled();

    let invalidAlert = screen.queryByText(
      /select at least one region to share to\./i
    );
    expect(invalidAlert).not.toBeInTheDocument();

    const selectToggle = screen.getByRole('button', { name: /options menu/i });
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => userEvent.click(selectToggle));

    const usEast2 = screen.getByRole('option', {
      name: /us-east-2 us east \(ohio\)/i,
    });
    expect(usEast2).not.toHaveClass('pf-m-disabled');
    userEvent.click(usEast2);
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
    view = renderWithReduxRouter(<ShareImageModal />, mockState, mockLocation);
    history = view.history;

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();

    // returns back to the landing page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/insights/image-builder/')
    );
  });

  test('close button redirects to landing page', async () => {
    view = renderWithReduxRouter(<ShareImageModal />, mockState, mockLocation);
    history = view.history;

    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();

    // returns back to the landing page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/insights/image-builder/')
    );
  });

  test('select options disabled correctly based on status and region', async () => {
    renderWithReduxRouter(<ShareImageModal />, mockState, mockLocation);
    history = view.history;

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
    view = renderWithReduxRouter(<ShareImageModal />, mockState, mockLocation);
    history = view.history;
    store = view.store;

    const selectToggle = screen.getByRole('button', { name: /options menu/i });
    userEvent.click(selectToggle);

    const usEast2 = screen.getByRole('option', {
      name: /us-east-2 us east \(ohio\)/i,
    });
    expect(usEast2).not.toHaveClass('pf-m-disabled');
    userEvent.click(usEast2);

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
      expect(history.location.pathname).toBe('/insights/image-builder/')
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
