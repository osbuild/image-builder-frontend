import type { RootState } from '@/store';

export const selectIsWizardModalOpen = (state: RootState) =>
  state.wizardModal.isModalOpen;

export const selectWizardModalMode = (state: RootState) =>
  state.wizardModal.mode;
