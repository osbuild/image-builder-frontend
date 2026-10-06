import React from 'react';

import { AwsDetails } from '@/Components/ImagesTable/components/ImageDetails';
import { CloudStatus } from '@/Components/ImagesTable/components/Status';
import { AwsTarget } from '@/Components/ImagesTable/components/Target';
import { AWSLaunchModal } from '@/Components/Launch/AWSLaunchModal';
import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

type AwsRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

const AwsRow = ({
  compose,
  rowIndex,
  onSelect,
  isSelected,
}: AwsRowPropTypes) => {
  const target = <AwsTarget />;
  const status = <CloudStatus compose={compose} />;
  const instance = <AWSLaunchModal compose={compose} />;
  const details = <AwsDetails compose={compose} />;

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      status={status}
      target={target}
      instance={instance}
      details={details}
      {...(onSelect && { onSelect })}
      {...(isSelected !== undefined && { isSelected })}
    />
  );
};

export default AwsRow;
