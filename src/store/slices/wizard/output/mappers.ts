import { createSelector } from '@reduxjs/toolkit';

import {
  selectBootcDistributions,
  selectImageSource,
  selectImageTypes,
  selectIsoPayloadReference,
} from './selectors';

import { selectIsImageMode } from '../details';

const mapBootcReference = createSelector(
  [
    selectIsImageMode,
    selectImageTypes,
    selectImageSource,
    selectBootcDistributions,
  ],
  (isImageMode, imageTypes, imageSource, distributions) => {
    if (isImageMode && imageSource) {
      const selectedDistro = distributions.find(
        (d) => d.reference === imageSource,
      );

      if (selectedDistro && imageTypes.length > 0) {
        const match = distributions.find(
          (d) => d.name === selectedDistro.name && d.type === imageTypes[0],
        );
        if (match) {
          return match.reference;
        }
      }

      return imageSource;
    }

    return undefined;
  },
);

const mapPayloadReference = createSelector(
  [selectImageTypes, selectIsoPayloadReference],
  (imageTypes, isoPayloadRef) => {
    if (imageTypes[0] !== 'bootable-container-iso' || !isoPayloadRef) {
      return undefined;
    }

    return { iso_payload_reference: isoPayloadRef };
  },
);

export const mapBootcOptions = createSelector(
  [mapBootcReference, mapPayloadReference],
  (bootcReference, payloadReference) => {
    if (!bootcReference) {
      return undefined;
    }

    return {
      bootc: {
        reference: bootcReference,
        ...payloadReference,
      },
    };
  },
);
