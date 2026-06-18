import { createAction } from '@reduxjs/toolkit';

import type { CombinedWizardState } from './types';

// we need to create standalone actions for the slice since we are
// breaking the wizard slice into submodules. We need to be able to
// call this actions and act on them from each submodule and this is
// the best solution to handling this.
export const initializeWizard = createAction('wizard/initializeWizard');
export const loadWizardState = createAction<CombinedWizardState>(
  'wizard/loadWizardState',
);
