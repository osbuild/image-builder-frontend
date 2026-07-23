import { isKnownImageRef } from '@/store/api/backend/onprem/constants';

import { initialState } from './state';
import { isSupportedImageType } from './typeguards';
import { ImageSourceType, OutputSlice } from './types';
import { getLatestRelease } from './utilities';

import { RequestLike } from '../types';

const parseArchitecture = ({
  image_requests,
}: RequestLike): OutputSlice['architecture'] => {
  if (!image_requests || image_requests.length === 0) {
    return initialState.architecture;
  }

  return image_requests[0].architecture;
};

const parseDistribution = ({
  distribution,
}: RequestLike): OutputSlice['distribution'] => {
  if (!distribution) {
    return initialState.distribution;
  }

  return getLatestRelease(distribution);
};

const parseImageTypes = ({
  image_requests,
}: RequestLike): OutputSlice['imageTypes'] => {
  if (!image_requests || image_requests.length === 0) {
    return initialState.imageTypes;
  }

  return image_requests.map((ir) => ir.image_type).filter(isSupportedImageType);
};

const parseImageSource = ({
  bootc,
}: RequestLike): OutputSlice['imageSource'] => {
  if (!bootc) {
    return initialState.imageSource;
  }

  return bootc.reference;
};

const parseIsoPayloadRef = ({
  bootc,
}: RequestLike): OutputSlice['isoPayloadReference'] => {
  if (!bootc) {
    return initialState.isoPayloadReference;
  }

  return bootc.iso_payload_reference;
};

const parseImageSourceType = ({ bootc }: RequestLike): ImageSourceType => {
  if (!bootc?.reference) {
    return initialState.imageSourceType;
  }

  if (!isKnownImageRef(bootc.reference)) {
    return 'custom';
  }

  return 'official';
};

export const parseOutputFromRequest = (request: RequestLike): OutputSlice => ({
  architecture: parseArchitecture(request),
  distribution: parseDistribution(request),
  imageTypes: parseImageTypes(request),
  imageSource: parseImageSource(request),
  imageSourceType: parseImageSourceType(request),
  isoPayloadReference: parseIsoPayloadRef(request),
  bootcDistributions: [],
});
