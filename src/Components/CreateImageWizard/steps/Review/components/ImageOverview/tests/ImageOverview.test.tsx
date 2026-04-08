import React from 'react';

import { screen } from '@testing-library/react';

import { RHEL_10, X86_64 } from '@/constants';
import { renderWithRedux } from '@/test/testUtils';

import ImageOverview from '../index';

describe('ImageOverview', () => {
  test('renders the card with image overview title', () => {
    renderWithRedux(<ImageOverview />);

    expect(screen.getByText('Image overview')).toBeInTheDocument();
  });

  test('displays the blueprint name', () => {
    renderWithRedux(<ImageOverview />, {
      details: {
        blueprintName: 'my-test-blueprint',
        blueprintDescription: '',
        isCustomName: true,
      },
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('my-test-blueprint')).toBeInTheDocument();
  });

  test('displays the blueprint description', () => {
    renderWithRedux(<ImageOverview />, {
      details: {
        blueprintName: 'test-blueprint',
        blueprintDescription: 'This is a test description',
        isCustomName: true,
      },
    });

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  test('displays the base release for package mode', () => {
    renderWithRedux(<ImageOverview />, {
      distribution: RHEL_10,
      blueprintMode: 'package',
    });

    expect(screen.getByText('Base release')).toBeInTheDocument();
    expect(
      screen.getByText('Red Hat Enterprise Linux (RHEL) 10'),
    ).toBeInTheDocument();
  });

  test('displays the architecture', () => {
    renderWithRedux(<ImageOverview />, {
      architecture: X86_64,
    });

    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText(X86_64)).toBeInTheDocument();
  });

  test('displays target environments heading', () => {
    renderWithRedux(<ImageOverview />);

    expect(screen.getByText('Target environments')).toBeInTheDocument();
  });
});
