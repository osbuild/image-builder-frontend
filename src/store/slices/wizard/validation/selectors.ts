import { RootState } from '@/store';

export const selectForceShowErrors = (state: RootState) => {
  return state.wizard.validation.forceShowErrors;
};
