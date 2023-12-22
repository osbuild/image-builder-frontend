import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Distributions, ImageRequest, ImageTypes } from './imageBuilderApi';

import { RHEL_9, X86_64 } from '../constants';

import { RootState } from '.';

type wizardState = {
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: ImageTypes[];
};

const initialState: wizardState = {
  architecture: X86_64,
  distribution: RHEL_9,
  imageTypes: [],
};

export const selectArchitecture = (state: RootState) => {
  return state.wizard.architecture;
};

export const selectDistribution = (state: RootState) => {
  return state.wizard.distribution;
};

export const selectImageTypes = (state: RootState) => {
  return state.wizard.imageTypes;
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>
    ) => {
      state.architecture = action.payload;
    },
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.distribution = action.payload;
    },
    addImageType: (state, action: PayloadAction<ImageTypes>) => {
      // Remove (if present) before adding to avoid duplicates
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload
      );
      state.imageTypes.push(action.payload);
    },
    removeImageType: (state, action: PayloadAction<ImageTypes>) => {
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload
      );
    },
    changeImageTypes: (state, action: PayloadAction<ImageTypes[]>) => {
      state.imageTypes = action.payload;
    },
    initializeWizard: () => initialState,
  },
});

export const {
  changeArchitecture,
  changeDistribution,
  addImageType,
  removeImageType,
  changeImageTypes,
  initializeWizard,
} = wizardSlice.actions;
export default wizardSlice.reducer;
