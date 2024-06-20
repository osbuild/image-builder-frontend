import React from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';

import { FILE_SYSTEM_CUSTOMIZATION_URL } from '../../../../constants';

const FileSystemAutomaticPartition = () => {
  return (
    <TextContent>
      <Text component={TextVariants.h3}>Automatic partitioning</Text>
      <Text>
        The system automatically partitions your image storage depending on the
        target environment(s). The target environment sometimes dictates all or
        part of the partitioning scheme. Automatic partitioning applies the most
        current supported configuration layout.
        <br></br>
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          href={FILE_SYSTEM_CUSTOMIZATION_URL}
          className="pf-u-pl-0"
        >
          Customizing file systems during the image creation
        </Button>
      </Text>
    </TextContent>
  );
};

export default FileSystemAutomaticPartition;
