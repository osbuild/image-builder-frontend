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
      docLinkProp={
        'https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html-single/creating_customized_images_by_using_insights_image_builder/index'
      }
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeImagesUrlName}
    />
  ) : (
    <Unavailable />
  );
};

export default ImagesTable;
