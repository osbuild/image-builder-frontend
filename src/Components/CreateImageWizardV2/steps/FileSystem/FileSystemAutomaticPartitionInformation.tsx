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
        Red Hat will automatically partition your image to what is best,
        depending on the target environment(s).
      </Text>
      <Text>
        The target environment sometimes dictates the partitioning scheme or
        parts of it, and sometimes the target environment is unknown (e.g., for
        the .qcow2 generic cloud image).
      </Text>
      <Text>
        Using automatic partitioning will apply the most current supported
        configuration.
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
