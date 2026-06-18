import React from 'react';

import { AzureLaunchModal } from '@/Components/Launch/AzureLaunchModal';
import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

import { AzureDetails } from '../../ImageDetails';
import { CloudStatus } from '../../Status';

type AzureRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const AzureRow = ({ compose, rowIndex }: AzureRowPropTypes) => {
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
    />
  );
};

export default AzureRow;
