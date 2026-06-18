import React from 'react';

import { screen } from '@testing-library/react';

import { ComposeStatusError } from '@/store/api/backend';
import { clickWithWait, createUser, renderWithRedux } from '@/test/testUtils';

import { createMockComposeStatus } from './mocks';

import ErrorStatus from '../components/ErrorStatus';
import ProgressStatus from '../components/ProgressStatus';
import Status from '../components/Status';

describe('Status Components', () => {
  describe('Status', () => {
    test('renders icon and text', () => {
      const mockIcon = <span data-testid='test-icon'>Icon</span>;
      const mockText = <span>Test Status</span>;

      renderWithRedux(<Status icon={mockIcon} text={mockText} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Status')).toBeInTheDocument();
    });
  });

  describe('ProgressStatus', () => {
    test('displays progress', async () => {
      const status = createMockComposeStatus({
        image_status: {
          status: 'building',
          progress: {
            done: 1,
            total: 20,
          },
        },
      });

      renderWithRedux(<ProgressStatus status={status} />);

      expect(await screen.findByText(/Image build in progress/)).toBeVisible();
      expect(await screen.findByText(/step 1 of 20/)).toBeVisible();
    });

    test('displays subprogress', async () => {
      const status = createMockComposeStatus({
        image_status: {
          status: 'building',
          progress: {
            done: 1,
            total: 20,
            subprogress: {
              done: 3,
              total: 4,
            },
          },
        },
      });

      renderWithRedux(<ProgressStatus status={status} />);

      expect(await screen.findByText(/Image build in progress/)).toBeVisible();
      expect(await screen.findByText(/step 1 of 20/)).toBeVisible();
      expect(await screen.findByText(/(substep 3 of 4)/)).toBeVisible();
    });
  });

  describe('ErrorStatus', () => {
    const mockIcon = <span data-testid='error-icon'>Icon</span>;
    const mockText = <span>Error occurred</span>;

    test('displays error with string', async () => {
      const user = createUser();

      renderWithRedux(
        <ErrorStatus
          icon={mockIcon}
          text={mockText}
          error='Simple error message'
        />,
      );

      const button = screen.getByRole('button');
      await clickWithWait(user, button);

      expect(
        await screen.findByText('Simple error message'),
      ).toBeInTheDocument();
    });

    test('displays error with reason and details', async () => {
      const user = createUser();
      const error: ComposeStatusError = {
        id: 1,
        reason: 'Build failed',
        details: [
          'Something went very very wrong',
          'And the build failed catastrophically',
        ],
      };

      renderWithRedux(
        <ErrorStatus icon={mockIcon} text={mockText} error={error} />,
      );

      const button = screen.getByRole('button');
      await clickWithWait(user, button);

      expect(await screen.findByText('Build failed')).toBeInTheDocument();
      expect(
        await screen.findByText(/Something went very very wrong/),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(/And the build failed catastrophically/),
      ).toBeInTheDocument();
    });
  });
});
