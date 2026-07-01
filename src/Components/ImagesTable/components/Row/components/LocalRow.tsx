import React from 'react';

import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

import { LocalDetails } from '../../ImageDetails';
import { LocalInstance } from '../../Instance';
import { LocalStatus } from '../../Status';

type LocalRowPropTypes = {
  compose: ComposesResponseItem;
  rowIndex: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
};

const LocalRow = ({
  compose,
  rowIndex,
  onSelect,
  isSelected,
}: LocalRowPropTypes) => {
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
      {...(onSelect && { onSelect })}
      {...(isSelected !== undefined && { isSelected })}
    />
  );
};

export default LocalRow;
