import React from 'react';

import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

import { LocalDetails } from '../../ImageDetails';
import { LocalInstance } from '../../Instance';
import { LocalStatus } from '../../Status';

type LocalRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
};

const LocalRow = ({ compose, rowIndex }: LocalRowPropTypes) => {
  const details = <LocalDetails compose={compose} />;
  const instance = <LocalInstance compose={compose} />;
  const status = <LocalStatus compose={compose} />;
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

export default LocalRow;
