import React from 'react';

import { LocalDetails } from '@/Components/ImagesTable/components/ImageDetails';
import { LocalInstance } from '@/Components/ImagesTable/components/Instance';
import { LocalStatus } from '@/Components/ImagesTable/components/Status';
import { ComposesResponseItem } from '@/store/api/backend';

import Row from './Row';

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
