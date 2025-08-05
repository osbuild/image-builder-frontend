import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

const composeId = '1579d95b-8f1d-4982-8c53-8c2afa4ab04c';

const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <div />,
  },
  {
    path: 'insights/image-builder/share/:composeId',
    element: <ShareImageModal />,
  },
];

describe('Create Share To Regions Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  test('validation', async () => {
    await renderCustomRoutesWithReduxRouter(`share/${composeId}`, {}, routes);

    const shareButton = await screen.findByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled();

    const selectToggle = await screen.findByRole('button', {
      name: /menu toggle/i,
    });
    user.click(selectToggle);

    const usEast2 = await screen.findByRole('option', {
      name: /us east \(ohio\) us-east-2/i,
    });
    expect(usEast2).toBeEnabled();
    user.click(usEast2);
    await waitFor(() => expect(shareButton).toBeEnabled());

    const clearAllButton = await screen.findByRole('button', {
      name: /clear input value/i,
    });
    user.click(clearAllButton);
    await waitFor(() => expect(shareButton).toBeDisabled());

    const invalidAlert = await screen.findByText(
      /select at least one region to share to\./i,
    );
    expect(invalidAlert).toBeInTheDocument();
  });

  test('cancel button redirects to landing page', async () => {
    const { router } = await renderCustomRoutesWithReduxRouter(
      `share/${composeId}`,
      {},
      routes,
    );

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    user.click(cancelButton);

    // returns back to the landing page
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/insights/image-builder'),
    );
  });

  test('close button redirects to landing page', async () => {
    const { router } = await renderCustomRoutesWithReduxRouter(
      `share/${composeId}`,
      {},
      routes,
    );

    const closeButton = await screen.findByRole('button', { name: /close/i });
    user.click(closeButton);

    // returns back to the landing page
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/insights/image-builder'),
    );
  });

  test('select options disabled correctly based on status and region', async () => {
    await renderCustomRoutesWithReduxRouter(`share/${composeId}`, {}, routes);

    const selectToggle = await screen.findByRole('button', {
      name: /menu toggle/i,
    });
    user.click(selectToggle);

    // parent region disabled
    const usEast1 = await screen.findByRole('option', {
      name: /us east \(n. virginia\) us-east-1/i,
    });
    expect(usEast1).toBeDisabled();

    // close the select again to avoid state update
    user.click(selectToggle);
  });

  // TODO Verify that sharing clones works once msw/data is incorporated.
});
