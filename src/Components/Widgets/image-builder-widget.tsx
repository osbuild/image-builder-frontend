import React from 'react';
import { SimpleServiceWidget } from './simple-service-widget';

const ImageBuilderWidget: React.FunctionComponent = () => {
  return (
    <>
      <SimpleServiceWidget
        id={3}
        body="Create customized system images for disks, VMs, and cloud platforms. Image Builder automates configurations, saving you time and ensuring consistent, deployment-ready images every time."
        linkTitle="Images"
        url="/insights/image-builder"
      />
    </>
  );
};

export default ImageBuilderWidget;
