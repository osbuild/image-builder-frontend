import React from 'react';

import { screen } from '@testing-library/react';

import { RHEL_10 } from '@/constants';
import {
  clickWithWait,
  renderWithRedux,
  type UserEventInstance,
  type WizardStateOverrides,
} from '@/test/testUtils';

import ArchSelect from '../components/ArchSelect';
import CentOSAcknowledgement from '../components/CentOSAcknowledgement';
import ReleaseLifecycle from '../components/ReleaseLifecycle';
import ReleaseSelect from '../components/ReleaseSelect';
import TargetEnvironment from '../components/TargetEnvironment';

// Default state overrides for most tests
const defaultStateOverrides: WizardStateOverrides = {
  distribution: RHEL_10,
  architecture: 'x86_64',
};

// Render functions
export const renderArchSelect = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<ArchSelect />, {
    ...defaultStateOverrides,
    ...wizardStateOverrides,
  });
};

// Interaction helpers
export const openArchSelect = async (user: UserEventInstance) => {
  const toggle = await screen.findByTestId('arch_select');
  await clickWithWait(user, toggle);
};

export const selectArch = async (user: UserEventInstance, arch: string) => {
  await openArchSelect(user);
  const option = await screen.findByRole('option', { name: arch });
  await clickWithWait(user, option);
};

// ReleaseSelect render function
export const renderReleaseSelect = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<ReleaseSelect />, {
    ...defaultStateOverrides,
    ...wizardStateOverrides,
  });
};

// ReleaseSelect interaction helpers
export const openReleaseSelect = async (user: UserEventInstance) => {
  const toggle = await screen.findByTestId('release_select');
  await clickWithWait(user, toggle);
};

export const selectRelease = async (
  user: UserEventInstance,
  releaseName: RegExp | string,
) => {
  await openReleaseSelect(user);
  const option = await screen.findByRole('option', { name: releaseName });
  await clickWithWait(user, option);
};

export const expandDevelopmentOptions = async (user: UserEventInstance) => {
  const loadMoreButton = await screen.findByRole('option', {
    name: /show options for further development/i,
  });
  await clickWithWait(user, loadMoreButton);
};

// TargetEnvironment render function
export const renderTargetEnvironment = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<TargetEnvironment />, {
    ...defaultStateOverrides,
    ...wizardStateOverrides,
  });
};

// TargetEnvironment interaction helpers
export const clickTargetCard = async (
  user: UserEventInstance,
  targetName: RegExp | string,
) => {
  const card = await screen.findByRole('button', { name: targetName });
  await clickWithWait(user, card);
};

export const clickTargetCheckbox = async (
  user: UserEventInstance,
  checkboxLabel: RegExp | string,
) => {
  const checkbox = await screen.findByRole('checkbox', { name: checkboxLabel });
  await clickWithWait(user, checkbox);
};

// ReleaseLifecycle render function
export const renderReleaseLifecycle = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<ReleaseLifecycle />, {
    ...defaultStateOverrides,
    ...wizardStateOverrides,
  });
};

// CentOSAcknowledgement render function
export const renderCentOSAcknowledgement = () => {
  return renderWithRedux(<CentOSAcknowledgement />);
};
