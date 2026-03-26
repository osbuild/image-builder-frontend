import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

type WizardModalState = {
  isModalOpen: boolean;
  mode: 'create' | 'edit' | 'import';
};

const initialState: WizardModalState = {
  isModalOpen: false,
  mode: 'create',
};

export const selectIsWizardModalOpen = (state: RootState) =>
  state.wizardModal.isModalOpen;

export const selectWizardModalMode = (state: RootState) =>
  state.wizardModal.mode;

export const wizardModalSlice = createSlice({
  name: 'wizardModal',
  initialState,
  reducers: {
    openWizardModal: (
      state,
      action: PayloadAction<'create' | 'edit' | 'import'>,
    ) => {
      state.isModalOpen = true;
      state.mode = action.payload;
    },
    closeWizardModal: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const { openWizardModal, closeWizardModal } = wizardModalSlice.actions;

export default wizardModalSlice.reducer;
