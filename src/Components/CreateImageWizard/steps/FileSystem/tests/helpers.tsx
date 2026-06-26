import React from 'react';

import { renderWithRedux, type WizardStateOverrides } from '@/test/testUtils';

import FileSystemStep from '../index';

export const renderFileSystemStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  return renderWithRedux(<FileSystemStep />, wizardStateOverrides);
};
