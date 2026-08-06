import React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  ClipboardCopy,
  Content,
} from '@patternfly/react-core';

const LocalImageSource = () => {
  return (
    <Card variant='secondary' className='pf-v6-u-mt-md'>
      <CardTitle>Local image support is coming soon</CardTitle>
      <CardBody>
        <Content component='p'>
          Cockpit Image Builder 10.4 will support building images from local
          containers. Until then, use the image-builder command-line tool:
        </Content>
        <ClipboardCopy isReadOnly isCode hoverTip='Copy' clickTip='Copied'>
          {
            'image-builder build qcow2 --bootc-ref localhost/my-derived-image:latest'
          }
        </ClipboardCopy>
      </CardBody>
    </Card>
  );
};

export default LocalImageSource;
