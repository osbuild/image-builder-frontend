import React from 'react';

import { Button, Content, ContentVariants } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { FILE_SYSTEM_CUSTOMIZATION_URL } from '../../../../../constants';

const FileSystemAutomaticPartition = () => {
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
        >
          Customizing file systems during the image creation
        </Button>
      </Content>
    </Content>
  );
};

export default FileSystemAutomaticPartition;
