import { RootState } from '@/store';

export const selectForceShowErrors = (state: RootState) => {
  return state.wizard.validation.forceShowErrors;
};

export const selectHasPendingInputs = (state: RootState) => {
  return state.wizard.validation.pendingInputs.length > 0;
};
