import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WizardModalState = {
  isModalOpen: boolean;
  mode: 'create' | 'edit' | 'import';
};

const initialState: WizardModalState = {
  isModalOpen: false,
  mode: 'create',
};

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
    closeWizardModal: () => {
      return initialState;
    },
  },
});

export const { openWizardModal, closeWizardModal } = wizardModalSlice.actions;
