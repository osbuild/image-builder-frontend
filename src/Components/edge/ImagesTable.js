import React from 'react';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Unavailable from '@redhat-cloud-services/frontend-components/Unavailable';
import { useFlag } from '@unleash/proxy-client-react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  getNotificationProp,
  manageEdgeImagesUrlName,
} from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';

const ImagesTable = () => {
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
  const edgeParityFlag = useFlag('edgeParity.image-list');

  return edgeParityFlag ? (
    <AsyncComponent
      appName="edge"
      module="./Images"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      showHeaderProp={false}
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeImagesUrlName}
    />
  ) : (
    <Unavailable />
  );
};

export default ImagesTable;
