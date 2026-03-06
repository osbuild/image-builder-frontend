import { screen } from '@testing-library/react';

import { renderCentOSAcknowledgement } from './helpers';

describe('CentOSAcknowledgement', () => {
  test('renders info alert about CentOS Stream', () => {
    renderCentOSAcknowledgement();

    expect(
      screen.getByText(
        /centos stream builds are intended for the development/i,
      ),
    ).toBeInTheDocument();
  });

  test('mentions builds are not supported for production', () => {
    renderCentOSAcknowledgement();

    expect(
      screen.getByText(/not supported for production workloads/i),
    ).toBeInTheDocument();
  });

  test('shows link to Red Hat Developer Program', () => {
    renderCentOSAcknowledgement();

    expect(
      screen.getByRole('link', { name: /red hat developer program/i }),
    ).toBeInTheDocument();
  });
});
