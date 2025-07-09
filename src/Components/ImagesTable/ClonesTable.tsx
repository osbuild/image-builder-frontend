import React, { useEffect, useState } from 'react';

import { ClipboardCopy } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AwsDetailsStatus, StatusClone } from './Status';

import {
  ClonesResponseItem,
  ComposesResponseItem,
  UploadStatus,
  useGetCloneStatusQuery,
  useGetComposeClonesQuery,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';

type RowPropTypes = {
  ami: JSX.Element;
  region: JSX.Element;
  status: JSX.Element;
};

type AmiPropTypes = {
  status: UploadStatus | undefined;
};

const Ami = ({ status }: AmiPropTypes) => {
  switch (status?.status) {
    case 'success':
      return (
        <ClipboardCopy
          hoverTip="Copy"
          clickTip="Copied"
          variant="inline-compact"
        >
          {'ami' in status.options ? status.options.ami : ''}
        </ClipboardCopy>
      );

    default:
      return undefined;
  }
};

const ComposeRegion = () => {
  return <p>us-east-1</p>;
};

type CloneRegionPropTypes = {
  region: string;
};

const CloneRegion = ({ region }: CloneRegionPropTypes) => {
  return <p>{region}</p>;
};

const Row = ({ ami, region, status }: RowPropTypes) => {
  return (
    <Tbody>
      <Tr className="no-bottom-border">
        <Td dataLabel="AMI">{ami}</Td>
        <Td dataLabel="Region">{region}</Td>
        <Td dataLabel="Status">{status}</Td>
      </Tr>
    </Tbody>
  );
};

type CloneRowPropTypes = {
  clone: ClonesResponseItem;
};

const CloneRow = ({ clone }: CloneRowPropTypes) => {
  const [pollingInterval, setPollingInterval] = useState(8000);

  const { data: status } = useGetCloneStatusQuery(
    {
      id: clone.id,
    },
    { pollingInterval: pollingInterval }
  );

  useEffect(() => {
    if (status?.status === 'success' || status?.status === 'failure') {
      setPollingInterval(0);
    } else {
      setPollingInterval(8000);
    }
  }, [setPollingInterval, status]);

  return (
    <Row
      ami={<Ami status={status} />}
      region={<CloneRegion region={clone.request.region} />}
      status={<StatusClone clone={clone} status={status} />}
    />
  );
};

type ComposeRowPropTypes = {
  compose: ComposesResponseItem;
};

const ComposeRow = ({ compose }: ComposeRowPropTypes) => {
  const { data, isSuccess } = useGetComposeStatusQuery({
    composeId: compose.id,
  });
  return isSuccess ? (
    <Row
      ami={<Ami status={data?.image_status.upload_status} />}
      region={<ComposeRegion />}
      status={<AwsDetailsStatus compose={compose} />}
    />
  ) : null;
};

export type ReducedClonesByRegion = {
  [region: string]: {
    clone: ClonesResponseItem;
    status: UploadStatus | undefined;
  };
};

type ClonesTablePropTypes = {
  compose: ComposesResponseItem;
};

const ClonesTable = ({ compose }: ClonesTablePropTypes) => {
  const { data } = useGetComposeClonesQuery({ composeId: compose.id });

  return (
    <Table variant="compact" data-testid="clones-table">
      <Thead>
        <Tr className="no-bottom-border">
          <Th className="pf-m-width-60">AMI</Th>
          <Th className="pf-m-width-20">Region</Th>
          <Th className="pf-m-width-20">Status</Th>
        </Tr>
      </Thead>
      <ComposeRow compose={compose} />
      {data?.data.map((clone) => (
        <CloneRow clone={clone} key={clone.id} />
      ))}
    </Table>
  );
};

export default ClonesTable;
