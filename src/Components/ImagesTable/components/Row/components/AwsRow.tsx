import React from 'react';

import { AWSLaunchModal } from '@/Components/Launch/AWSLaunchModal';
import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

import { AwsDetails } from '../../ImageDetails';
import { CloudStatus } from '../../Status';
import { AwsTarget } from '../../Target';

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
