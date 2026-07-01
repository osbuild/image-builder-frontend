import React from 'react';

import { AzureLaunchModal } from '@/Components/Launch/AzureLaunchModal';
import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

import { AzureDetails } from '../../ImageDetails';
import { CloudStatus } from '../../Status';

type AzureRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

const AzureRow = ({
  compose,
  rowIndex,
  onSelect,
  isSelected,
}: AzureRowPropTypes) => {
  const details = <AzureDetails compose={compose} />;
  const instance = <AzureLaunchModal compose={compose} />;
  const status = <CloudStatus compose={compose} />;

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      instance={instance}
      status={status}
      {...(onSelect && { onSelect })}
      {...(isSelected !== undefined && { isSelected })}
    />
  );
};

export default AzureRow;
