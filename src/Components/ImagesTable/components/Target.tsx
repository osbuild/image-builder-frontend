import React from 'react';

import { targetOptions } from '@/constants';
import { ComposesResponseItem } from '@/store/api/backend';

type TargetProps = {
  compose: ComposesResponseItem;
};

export const Target = ({ compose }: TargetProps) => {
  return <p>{targetOptions[compose.request.image_requests[0].image_type]}</p>;
};

export const AwsTarget = () => <>{targetOptions.aws}</>;
