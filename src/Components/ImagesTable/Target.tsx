import React from 'react';

import { ComposesResponseItem } from '@/store/api/backend';

import { targetOptions } from '../../constants';

type TargetPropTypes = {
  compose: ComposesResponseItem;
};

export const Target = ({ compose }: TargetPropTypes) => {
  return <p>{targetOptions[compose.request.image_requests[0].image_type]}</p>;
};

export const AwsTarget = () => <>{targetOptions.aws}</>;
