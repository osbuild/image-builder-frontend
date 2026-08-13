import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WizardModalState = {
  isModalOpen: boolean;
  mode: 'create' | 'edit' | 'import';
  // Lives in the store rather than a ref because chrome remounts this module
  // routinely; a ref resets on remount and lets the wizard re-initialize on
  // top of whatever the user has already entered.
  hasInitialized: boolean;
};

const initialState: WizardModalState = {
  isModalOpen: false,
  mode: 'create',
  hasInitialized: false,
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
    markWizardInitialized: (state) => {
      state.hasInitialized = true;
    },
    closeWizardModal: () => {
      return initialState;
    },
  },
});

export const { openWizardModal, markWizardInitialized, closeWizardModal } =
  wizardModalSlice.actions;
