import { RootState } from '@/store';

export const selectForceShowErrors = (state: RootState) => {
  return state.wizard.validation.forceShowErrors;
};

export const selectPendingInputFields = (state: RootState) => {
  return state.wizard.validation.pendingInputFields;
};
