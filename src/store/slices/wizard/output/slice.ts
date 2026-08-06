import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  BootcDistributionItem,
  Distributions,
  ImageRequest,
} from '@/store/api/backend';
import { KNOWN_IMAGES } from '@/store/api/backend/onprem/constants';

import { initialState } from './state';
import { ImageSource, ImageSourceType, SupportedImageTypes } from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const outputSlice = createSlice({
  name: 'wizard/output',
  initialState,
  reducers: {
    changeImageSource: (
      state,
      action: PayloadAction<ImageSource | undefined>,
    ) => {
      state.imageSource = action.payload;
    },
    changeImageSourceType: (state, action: PayloadAction<ImageSourceType>) => {
      state.imageSourceType = action.payload;
      // Clear the selected image when switching source types
      state.imageSource = undefined;
    },
    changeIsoPayloadReference: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      state.isoPayloadReference = action.payload;
    },
    changeBootcDistributions: (
      state,
      action: PayloadAction<BootcDistributionItem[]>,
    ) => {
      state.bootcDistributions = action.payload;
    },
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>,
    ) => {
      state.architecture = action.payload;
    },
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.distribution = action.payload;
    },
    addImageType: (state, action: PayloadAction<SupportedImageTypes>) => {
      // Remove (if present) before adding to avoid duplicates
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload,
      );
      state.imageTypes.push(action.payload);
    },
    removeImageType: (state, action: PayloadAction<SupportedImageTypes>) => {
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload,
      );
    },
    changeImageTypes: (state, action: PayloadAction<SupportedImageTypes[]>) => {
      state.imageTypes = action.payload;
      // isoPayloadReference is only relevant for bootable-container-iso,
      // clear it when that image type is no longer selected
      if (!action.payload.includes('bootable-container-iso')) {
        state.isoPayloadReference = undefined;
      }
      // Official images ship one container per output type under a
      // shared name; keep the selected image in sync with the type so
      // the target environment radios and the image dropdown always
      // agree.
      const known = KNOWN_IMAGES.find((k) => k.reference === state.imageSource);
      if (
        known &&
        action.payload.length > 0 &&
        known.type !== action.payload[0]
      ) {
        const sibling = KNOWN_IMAGES.find(
          (k) => k.name === known.name && k.type === action.payload[0],
        );
        if (sibling) {
          state.imageSource = sibling.reference;
        }
      }
      // The container installer needs a payload container; default to
      // the one the selected official image ships with.
      if (
        action.payload.includes('bootable-container-iso') &&
        !state.isoPayloadReference
      ) {
        const installer = KNOWN_IMAGES.find(
          (k) => k.reference === state.imageSource,
        );
        state.isoPayloadReference = installer?.iso_payload_references?.[0];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `details` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).output ??
          initialState,
      );
  },
});

export const {
  changeImageSource,
  changeImageSourceType,
  changeIsoPayloadReference,
  changeBootcDistributions,
  changeArchitecture,
  changeDistribution,
  addImageType,
  removeImageType,
  changeImageTypes,
} = outputSlice.actions;
