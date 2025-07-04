import React from 'react';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Unavailable from '@redhat-cloud-services/frontend-components/Unavailable';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import {
  useGetNotificationProp,
  manageEdgeImagesUrlName,
} from '../../Hooks/Edge/useGetNotificationProp';
import { resolveRelPath } from '../../Utilities/path';
import { useFlag } from '../../Utilities/useGetEnvironment';

const ImageDetail = () => {
  const notificationProp = useGetNotificationProp();
  // Feature flag for the federated modules
  const edgeParityFlag = useFlag('edgeParity.image-list');
  // Feature flag to access the 'local' images table list
  const edgeLocalImageTable = useFlag('image-builder.edge.local-image-table');

  if (edgeLocalImageTable) {
    return <div />;
  }
  if (edgeParityFlag) {
    return (
      <AsyncComponent
        scope="edge"
        module="./ImagesDetail"
        ErrorComponent={<ErrorState />}
        navigateProp={useNavigate}
        locationProp={useLocation}
        notificationProp={notificationProp}
        pathPrefix={resolveRelPath('')}
        urlName={manageEdgeImagesUrlName}
        paramsProp={useParams}
      />
    );
  } else {
    return <Unavailable />;
  }
};

export default ImageDetail;
