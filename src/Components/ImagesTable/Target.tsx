import React from 'react';

import { targetOptions } from '../../constants';
import { ComposesResponseItem } from '../../store/imageBuilderApi';

type TargetPropTypes = {
  compose: ComposesResponseItem;
};

export const Target = ({ compose }: TargetPropTypes) => {
  return <p>{targetOptions[compose.request.image_requests[0].image_type]}</p>;
};

export const AwsTarget = () => <>{targetOptions.aws}</>;
