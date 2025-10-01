import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CodeBlock,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';

import { useAppDispatch } from '../../../../../store/hooks';
import { VolumeGroup } from '../../../../../store/imageBuilderApi';
import {
  changeDiskPartitionMinsize,
  changeDiskPartitionName,
  removeDiskPartition,
} from '../../../../../store/wizardSlice';
import { FscDiskPartition, FscDiskPartitionBase } from '../fscTypes';

type VolumeGroupsType = {
  volumeGroups: Extract<FscDiskPartition, VolumeGroup & FscDiskPartitionBase>[];
};

const VolumeGroups = ({ volumeGroups }: VolumeGroupsType) => {
  const dispatch = useAppDispatch();

  return volumeGroups.map((vg) => (
    <Card key={vg.id}>
      <CardBody>
        <FormGroup label='Volume group name'>
          <TextInput
            aria-label='Volume group name input'
            value={vg.name || ''}
            type='text'
            onChange={(event, name) =>
              dispatch(changeDiskPartitionName({ id: vg.id, name: name }))
            }
            placeholder='Add volume group name'
            className='pf-v6-u-w-25'
          />
        </FormGroup>
        <FormGroup label='Minimum volume group size'>
          <TextInput
            aria-label='Minimum volume group size input'
            value={vg.minsize || ''}
            type='text'
            onChange={(event, minsize) =>
              dispatch(
                changeDiskPartitionMinsize({ id: vg.id, min_size: minsize }),
              )
            }
            placeholder='Define minimum volume group size'
            className='pf-v6-u-w-25'
          />
        </FormGroup>
        <CodeBlock readOnly>
          <pre>{JSON.stringify(vg.logical_volumes, null, 2)}</pre>
        </CodeBlock>
      </CardBody>
      <CardFooter>
        <Button
          variant='plain'
          aria-label='Remove volume group button'
          icon={<TrashIcon />}
          onClick={() => dispatch(removeDiskPartition(vg.id))}
        />
      </CardFooter>
    </Card>
  ));
};

export default VolumeGroups;
