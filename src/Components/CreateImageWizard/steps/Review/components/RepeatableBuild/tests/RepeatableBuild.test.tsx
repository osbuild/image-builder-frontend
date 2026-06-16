import React from 'react';

import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { renderWithRedux } from '@/test/testUtils';

import { createDefaultRestrictions } from '../../tests/helpers';
import RepeatableBuild from '../index';

describe('RepeatableBuild', () => {
  test('renders the repeatable build card when enabled', () => {
    renderWithRedux(
      <RepeatableBuild restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
        content: {
          ...initialState.content,
          snapshotting: {
            useLatest: false,
            snapshotDate: '',
            template: '',
            templateName: '',
          },
        },
      },
    );

    const repeatableBuildTexts = screen.getAllByText('Repeatable build');
    expect(repeatableBuildTexts).toHaveLength(2); // Card title and review group heading
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  test('displays snapshot date when provided', () => {
    renderWithRedux(
      <RepeatableBuild restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
        content: {
          ...initialState.content,
          snapshotting: {
            useLatest: false,
            snapshotDate: '2026-04-10',
            template: '',
            templateName: '',
          },
        },
      },
    );

    expect(screen.getByText('Snapshot date')).toBeInTheDocument();
    expect(screen.getByText('Apr 10, 2026')).toBeInTheDocument();
  });

  test('does not display snapshot date when not provided', () => {
    renderWithRedux(
      <RepeatableBuild restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
        content: {
          ...initialState.content,
          snapshotting: {
            useLatest: true,
            snapshotDate: '',
            template: '',
            templateName: '',
          },
        },
      },
    );

    expect(screen.queryByText('Snapshot date')).not.toBeInTheDocument();
  });

  test('does not render when useLatest is true', () => {
    renderWithRedux(
      <RepeatableBuild restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
        content: {
          ...initialState.content,
          snapshotting: {
            useLatest: true,
            snapshotDate: '',
            template: '',
            templateName: '',
          },
        },
      },
    );

    expect(
      screen.queryByText('Enable repeatable build'),
    ).not.toBeInTheDocument();
  });
});
