import React, { useEffect } from 'react';

import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';

import { useSearchRpmMutation } from '../../../../../store/contentSourcesApi';

type PackageRecommendationDescriptionTypes = {
  pkg: string;
  urls: string[];
};

const PackageRecommendationDescription = ({
  pkg,
  urls,
}: PackageRecommendationDescriptionTypes) => {
  const [
    searchRpms,
    {
      data: dataPkgRecInfo,
      isSuccess: isSuccessPkgRecInfo,
      isLoading: isLoadingPkgRecInfo,
      isError: isErrorPkgRecInfo,
    },
  ] = useSearchRpmMutation();

  useEffect(() => {
    searchRpms({
      apiContentUnitSearchRequest: {
        search: pkg,
        urls: urls,
      },
    });
  }, [pkg, searchRpms, urls]);

  if (isLoadingPkgRecInfo) {
    return <Spinner size="md" />;
  }
  if (isSuccessPkgRecInfo && dataPkgRecInfo) {
    if (dataPkgRecInfo.length > 0) {
      return dataPkgRecInfo[0].summary;
    } else {
      return 'Package was not found in distribution repositories';
    }
  }
  if (isErrorPkgRecInfo) {
    return 'There was an error when fetching a description';
  }
};

export default PackageRecommendationDescription;
