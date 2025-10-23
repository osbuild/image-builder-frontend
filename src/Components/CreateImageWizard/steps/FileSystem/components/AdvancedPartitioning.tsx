import React from 'react';

import {
  Button,
  CodeBlock,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { PARTITIONING_URL } from '../../../../../constants';
import { useAppSelector } from '../../../../../store/hooks';
import {
  selectDiskMinsize,
  selectDiskPartitions,
  selectDiskType,
} from '../../../../../store/wizardSlice';

const AdvancedPartitioning = () => {
  const minsize = useAppSelector(selectDiskMinsize);
  const type = useAppSelector(selectDiskType);
  const diskPartitions = useAppSelector(selectDiskPartitions);

  return (
    <>
      <Content>
        <Content component={ContentVariants.h3}>Configure disk layout</Content>
      </Content>
      <Content>
        <Content>Define complete partition table for your image.</Content>
        <Content>
          The order of partitions may change when the image is installed in
          order to conform to best practices and ensure functionality.
          <br></br>
          <Button
            component='a'
            target='_blank'
            variant='link'
            icon={<ExternalLinkAltIcon />}
            iconPosition='right'
            href={PARTITIONING_URL}
            className='pf-v6-u-pl-0'
          >
            Read more about advanced partitioning here
          </Button>
        </Content>
      </Content>
      <CodeBlock readOnly>
        <pre>{`minsize: ${minsize}
type: ${type}
diskPartitions: ${JSON.stringify(diskPartitions, null, 2)}`}</pre>
      </CodeBlock>
    </>
  );
};

export default AdvancedPartitioning;
