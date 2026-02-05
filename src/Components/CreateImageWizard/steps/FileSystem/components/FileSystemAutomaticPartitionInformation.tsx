import React from 'react';

import { Button, Content, ContentVariants } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import {
  AMPLITUDE_MODULE_NAME,
  FILE_SYSTEM_CUSTOMIZATION_URL,
} from '../../../../../constants';
import { useGetUser } from '../../../../../Hooks';
import { selectIsOnPremise } from '../../../../../store/envSlice';
import { useAppSelector } from '../../../../../store/hooks';

const FileSystemAutomaticPartition = () => {
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  return (
    <Content>
      <Content component={ContentVariants.h3}>Automatic partitioning</Content>
      <Content>
        The system automatically partitions your image storage depending on the
        target environment(s). The target environment sometimes dictates all or
        part of the partitioning scheme. Automatic partitioning applies the most
        current supported configuration layout.
        <br></br>
        <Button
          component='a'
          target='_blank'
          variant='link'
          icon={<ExternalLinkAltIcon />}
          iconPosition='right'
          href={FILE_SYSTEM_CUSTOMIZATION_URL}
          className='pf-v6-u-pl-0'
          onClick={() => {
            if (!isOnPremise) {
              analytics.track(
                `${AMPLITUDE_MODULE_NAME} - Outside link clicked`,
                {
                  account_id:
                    userData?.identity.internal?.account_id || 'Not found',
                  step_id: 'step-file-system',
                },
              );
            }
          }}
        >
          Customizing file systems during the image creation
        </Button>
      </Content>
    </Content>
  );
};

export default FileSystemAutomaticPartition;
