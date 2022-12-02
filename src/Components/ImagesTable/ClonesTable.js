import React from 'react';

import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ImageBuildStatus } from './ImageBuildStatus';
import ImageLink from './ImageLink';

import {
  selectClonesById,
  selectComposeById,
  selectImageById,
} from '../../store/composesSlice';
import { timestampToDisplayString } from '../../Utilities/time';

const Row = ({ imageId }) => {
  const image = useSelector((state) => selectImageById(state, imageId));
  return (
    <Tbody>
      <Tr>
        <Td dataLabel="UUID">{image.id}</Td>
        <Td dataLabel="Created">
          {timestampToDisplayString(image.created_at)}
        </Td>
        <Td dataLabel="Account">{image.share_with_accounts?.[0]}</Td>
        <Td dataLabel="Region">{image.region}</Td>
        <Td dataLabel="Status">
          <ImageBuildStatus imageId={image.id} />
        </Td>
        <Td dataLabel="Instance">
          <ImageLink imageId={image.id} isInClonesTable={true} />
        </Td>
      </Tr>
    </Tbody>
  );
};

const ClonesTable = ({ composeId }) => {
  const parentCompose = useSelector((state) =>
    selectComposeById(state, composeId)
  );
  const clones = useSelector((state) => selectClonesById(state, composeId));

  return (
    <TableComposable
      variant="compact"
      className="pf-u-mb-md"
      data-testid="clones-table"
    >
      <Thead>
        <Tr className="no-bottom-border">
          <Th>UUID</Th>
          <Th>Created</Th>
          <Th>Account</Th>
          <Th>Region</Th>
          <Th>Status</Th>
          <Th>Instance</Th>
        </Tr>
      </Thead>
      <Row imageId={parentCompose.id} imageType={'compose'} />
      {clones.map((clone) => (
        <Row imageId={clone.id} key={clone.id} />
      ))}
    </TableComposable>
  );
};

Row.propTypes = {
  imageId: PropTypes.string,
};

ClonesTable.propTypes = {
  composeId: PropTypes.string,
};

export default ClonesTable;
