import React from 'react';

import { Button, Label, Content, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon, UploadIcon } from '@patternfly/react-icons';

import { CONTENT_URL } from '../../../../../constants';

const UploadRepositoryLabel = () => {
  return (
    <Tooltip
      content={
        <Content>
          Upload repository: Snapshots will only be taken when new content is
          uploaded.&nbsp;
          <Button
            component="a"
            target="_blank"
            variant="link"
            iconPosition="right"
            isInline
            icon={<ExternalLinkAltIcon />}
            href={CONTENT_URL}
          >
            Create and manage repositories here.
          </Button>
        </Content>
      }
    >
      <Label
        variant="outline"
        isCompact
        icon={<UploadIcon />}
        style={{ marginLeft: '8px' }}
      >
        Upload
      </Label>
    </Tooltip>
  );
};

export default UploadRepositoryLabel;
