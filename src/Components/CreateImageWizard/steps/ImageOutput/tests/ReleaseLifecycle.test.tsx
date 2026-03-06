import { screen } from '@testing-library/react';

import { RHEL_10, RHEL_8, RHEL_9 } from '@/constants';
import { clickWithWait, createUser } from '@/test/testUtils';

import { renderReleaseLifecycle } from './helpers';

describe('ReleaseLifecycle', () => {
  describe('Visibility based on distribution', () => {
    test('shows lifecycle chart for RHEL 8', () => {
      renderReleaseLifecycle({ distribution: RHEL_8 });

      expect(
        screen.getByRole('region', {
          name: /hide information about release lifecycle/i,
        }),
      ).toBeInTheDocument();
    });

    test('shows lifecycle chart for RHEL 9', () => {
      renderReleaseLifecycle({ distribution: RHEL_9 });

      expect(
        screen.getByRole('region', {
          name: /hide information about release lifecycle/i,
        }),
      ).toBeInTheDocument();
    });

    test('does not show lifecycle chart for RHEL 10', () => {
      renderReleaseLifecycle({ distribution: RHEL_10 });

      expect(
        screen.queryByRole('region', {
          name: /hide information about release lifecycle/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Expandable section', () => {
    test('is expanded by default', () => {
      renderReleaseLifecycle({ distribution: RHEL_9 });

      // The toggle button text indicates "Hide" when expanded
      expect(
        screen.getByRole('button', {
          name: /hide information about release lifecycle/i,
        }),
      ).toBeInTheDocument();
    });

    test('can be collapsed', async () => {
      const user = createUser();
      renderReleaseLifecycle({ distribution: RHEL_9 });

      const toggleButton = screen.getByRole('button', {
        name: /hide information about release lifecycle/i,
      });

      await clickWithWait(user, toggleButton);

      expect(
        screen.getByRole('button', {
          name: /show information about release lifecycle/i,
        }),
      ).toBeInTheDocument();
    });

    test('shows link to lifecycle documentation', () => {
      renderReleaseLifecycle({ distribution: RHEL_9 });

      expect(
        screen.getByRole('link', {
          name: /view red hat enterprise linux life cycle dates/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
