import React from 'react';

import {
  Button,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

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
          href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/creating_customized_images_by_using_insights_image_builder/customizing-file-systems-during-the-image-creation"
          className="pf-u-pl-0"
        >
          Customizing file systems during the image creation
        </Button>
      </Text>
    </TextContent>
  );
};

export default FileSystemAutomaticPartition;
