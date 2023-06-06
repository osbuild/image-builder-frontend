import React from 'react';

import { ClipboardCopy } from '@patternfly/react-core';
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

import { CloneStatus, ComposeStatus } from './ImageBuildStatus';

import {
  selectClonesById,
  selectComposeById,
  selectImageById,
} from '../../store/composesSlice';

const Row = ({ imageId, isClone }) => {
  const image = useSelector((state) => selectImageById(state, imageId));

  return (
    <Tbody>
      <Tr className="no-bottom-border">
        <Td dataLabel="AMI">
          {image.status === 'success' && (
            <ClipboardCopy
              hoverTip="Copy"
              clickTip="Copied"
              variant="inline-compact"
            >
              {image.ami}
            </ClipboardCopy>
          )}
        </Td>
        <Td dataLabel="Region">{image.region}</Td>
        <Td dataLabel="Status">
          {isClone ? (
            <CloneStatus cloneId={image.id} />
          ) : (
            <ComposeStatus composeId={image.id} />
          )}
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
    <TableComposable variant="compact" data-testid="clones-table">
      <Thead>
        <Tr className="no-bottom-border">
          <Th className="pf-m-width-60">AMI</Th>
          <Th className="pf-m-width-20">Region</Th>
          <Th className="pf-m-width-20">Status</Th>
        </Tr>
      </Thead>
      <Row imageId={parentCompose.id} isClone={false} />
      {clones.map((clone) => (
        <Row imageId={clone.id} key={clone.id} isClone={true} />
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
