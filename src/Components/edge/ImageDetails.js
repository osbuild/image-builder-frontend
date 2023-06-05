import React from 'react';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import Unavailable from '@redhat-cloud-services/frontend-components/Unavailable';
import { useFlag } from '@unleash/proxy-client-react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import {
  getNotificationProp,
  manageEdgeImagesUrlName,
} from '../../Utilities/edge';
import { resolveRelPath } from '../../Utilities/path';

const ImageDetail = () => {
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
  const edgeParityFlag = useFlag('edgeParity.image-list');

  return edgeParityFlag ? (
    <AsyncComponent
      appName="edge"
      module="./ImagesDetail"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeImagesUrlName}
      paramsProp={useParams}
    />
  ) : (
    <Unavailable />
  );
};

export default ImageDetail;
