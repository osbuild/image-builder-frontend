import React from 'react';

import { ContentOrigin } from '@/constants';
import { ApiRepositoryResponseRead } from '@/store/api/contentSources';

import CommunityRepositoryLabel from './CommunityRepositoryLabel';
import CustomEpelWarning from './CustomEpelWarning';
import UploadRepositoryLabel from './UploadRepositoryLabel';

import { isEPELUrl } from '../repositoriesUtilities';

type RepositoryLabelProps = {
  origin: ApiRepositoryResponseRead['origin'];
  url: string;
};

const RepositoryLabel = ({ origin, url }: RepositoryLabelProps) => {
  if (origin === ContentOrigin.UPLOAD) {
    return <UploadRepositoryLabel />;
  }
  if (origin === ContentOrigin.COMMUNITY) {
    return <CommunityRepositoryLabel />;
  }
  if (isEPELUrl(url)) {
    return <CustomEpelWarning />;
  }
  return null;
};

export default RepositoryLabel;
