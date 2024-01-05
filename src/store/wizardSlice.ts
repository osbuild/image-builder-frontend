import { createSlice } from '@reduxjs/toolkit';

type wizardState = {};

const initialState: wizardState = {};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
  },
});

export const { initializeWizard } = wizardSlice.actions;
export default wizardSlice.reducer;
