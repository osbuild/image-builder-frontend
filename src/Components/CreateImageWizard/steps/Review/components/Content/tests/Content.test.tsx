import React from 'react';

import { screen } from '@testing-library/react';

import { renderWithRedux } from '@/test/testUtils';

import { createDefaultRestrictions } from '../../tests/helpers';
import ContentOverview from '../index';

describe('ContentOverview', () => {
  test('renders the content card with title', () => {
    renderWithRedux(
      <ContentOverview restrictions={createDefaultRestrictions()} />,
      {
        imageTypes: ['guest-image'],
      },
    );

    expect(screen.getByText('Repositories and packages')).toBeInTheDocument();
  });

  describe('Repositories', () => {
    test('displays "No repositories selected" when none are selected', () => {
      renderWithRedux(
        <ContentOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          repositories: {
            customRepositories: [],
            payloadRepositories: [],
            recommendedRepositories: [],
            redHatRepositories: [],
          },
        },
      );

      expect(screen.getByText('Repositories')).toBeInTheDocument();
      expect(screen.getByText('No repositories selected')).toBeInTheDocument();
    });
  });

  describe('Packages', () => {
    test('displays "No packages selected" when none are selected', () => {
      renderWithRedux(
        <ContentOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          packages: [],
        },
      );

      expect(screen.getByText('Packages')).toBeInTheDocument();
      expect(screen.getByText('No packages selected')).toBeInTheDocument();
    });

    test('displays selected packages', () => {
      renderWithRedux(
        <ContentOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          packages: [
            { name: 'vim', summary: 'Text editor', repository: 'distro' },
            { name: 'htop', summary: 'Process viewer', repository: 'distro' },
          ],
        },
      );

      expect(screen.getByText('vim')).toBeInTheDocument();
      expect(screen.getByText('htop')).toBeInTheDocument();
    });

    test('displays user-selected packages with blue labels', () => {
      renderWithRedux(
        <ContentOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          packages: [
            { name: 'vim', summary: 'Text editor', repository: 'distro' },
          ],
        },
      );

      const label = screen.getByText('vim').closest('.pf-v6-c-label');
      expect(label).toHaveClass('pf-m-blue');
    });

    test('displays oscap packages with default (grey) labels', () => {
      renderWithRedux(
        <ContentOverview
          restrictions={createDefaultRestrictions()}
          oscapPackages={['aide', 'audit']}
        />,
        {
          imageTypes: ['guest-image'],
          packages: [
            {
              name: 'aide',
              summary: 'Intrusion detection',
              repository: 'distro',
            },
          ],
        },
      );

      const label = screen.getByText('aide').closest('.pf-v6-c-label');
      // Grey is the default color, so no color modifier class is applied
      expect(label).not.toHaveClass('pf-m-blue');
      expect(label).toHaveClass('pf-m-filled');
    });

    test('displays mixed packages with correct label colors', () => {
      renderWithRedux(
        <ContentOverview
          restrictions={createDefaultRestrictions()}
          oscapPackages={['aide']}
        />,
        {
          imageTypes: ['guest-image'],
          packages: [
            {
              name: 'aide',
              summary: 'Intrusion detection',
              repository: 'distro',
            },
            { name: 'vim', summary: 'Text editor', repository: 'distro' },
          ],
        },
      );

      const aideLabel = screen.getByText('aide').closest('.pf-v6-c-label');
      const vimLabel = screen.getByText('vim').closest('.pf-v6-c-label');

      // Oscap packages use grey (default), user packages use blue
      expect(aideLabel).not.toHaveClass('pf-m-blue');
      expect(vimLabel).toHaveClass('pf-m-blue');
    });
  });

  describe('Package groups', () => {
    test('displays "No groups selected" when none are selected', () => {
      renderWithRedux(
        <ContentOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          groups: [],
        },
      );

      expect(screen.getByText('Package groups')).toBeInTheDocument();
      expect(screen.getByText('No groups selected')).toBeInTheDocument();
    });

    test('displays selected package groups', () => {
      renderWithRedux(
        <ContentOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          groups: [
            {
              name: 'Development Tools',
              description: 'Dev tools',
              repository: 'distro',
            },
            {
              name: 'Web Server',
              description: 'Web server packages',
              repository: 'distro',
            },
          ],
        },
      );

      expect(screen.getByText('Development Tools')).toBeInTheDocument();
      expect(screen.getByText('Web Server')).toBeInTheDocument();
    });
  });
});
