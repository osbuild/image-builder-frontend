import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { clickWithWait, renderWithRedux } from '@/test/testUtils';

import { DownloadsModal } from '../DownloadsModal';

const renderModal = () => {
  const setShowDownloadsModal = vi.fn();
  return {
    ...renderWithRedux(
      <DownloadsModal setShowDownloadsModal={setShowDownloadsModal} isOpen />,
    ),
    setShowDownloadsModal,
  };
};

describe('DownloadsModal', () => {
  test('renders modal with title and description', () => {
    renderModal();
    expect(screen.getByText('Build and download RHEL')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Download Red Hat Enterprise Linux \(RHEL\) ISOs and images tailored for your environment/,
      ),
    ).toBeInTheDocument();
  });

  test('renders network install images section', () => {
    renderModal();
    expect(screen.getByText('Network install images')).toBeInTheDocument();
    expect(
      screen.getByText('Red Hat Enterprise Linux 10 Boot ISO'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Red Hat Enterprise Linux 9.6 Boot ISO'),
    ).toBeInTheDocument();
  });

  test('renders offline install images section', () => {
    renderModal();
    expect(screen.getByText('Offline install images')).toBeInTheDocument();
    expect(
      screen.getByText('Red Hat Enterprise Linux 10 Binary DVD'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Red Hat Enterprise Linux 9.6 Binary DVD'),
    ).toBeInTheDocument();
  });

  test('renders download image buttons for all cards', () => {
    renderModal();
    const downloadButtons = screen.getAllByRole('button', {
      name: /download image/i,
    });
    expect(downloadButtons).toHaveLength(4);
  });

  test('renders help icon buttons for all cards', () => {
    renderModal();
    const helpButtons = screen.getAllByRole('button', { name: /^About / });
    expect(helpButtons).toHaveLength(4);
  });

  test('opens popover with image info on help icon click', async () => {
    const user = userEvent.setup();
    renderModal();

    const helpButton = screen.getByRole('button', {
      name: 'About Red Hat Enterprise Linux 10 Boot ISO',
    });
    await clickWithWait(user, helpButton);

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
    expect(screen.getByText('File name')).toBeInTheDocument();
    expect(screen.getByText('rhel-10-boot.iso')).toBeInTheDocument();
    expect(screen.getByText('File size')).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
  });

  test('calls setShowDownloadsModal on close', async () => {
    const user = userEvent.setup();
    const { setShowDownloadsModal } = renderModal();

    const closeButton = screen.getByRole('button', { name: /close/i });
    await clickWithWait(user, closeButton);

    expect(setShowDownloadsModal).toHaveBeenCalledWith(false);
  });
});
