import React from 'react';

import { GcpLaunchModal } from '@/Components/Launch/GcpLaunchModal';
import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

import { GcpDetails } from '../../ImageDetails';
import { CloudStatus } from '../../Status';

type GcpRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const GcpRow = ({ compose, rowIndex }: GcpRowPropTypes) => {
  const details = <GcpDetails compose={compose} />;
  const instance = <GcpLaunchModal compose={compose} />;
  const status = <CloudStatus compose={compose} />;

  return (
    <Row
      compose={compose}
      rowIndex={rowIndex}
      details={details}
      status={status}
      instance={instance}
    />
  );
};

export default GcpRow;
