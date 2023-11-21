import React from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import {
  Spinner,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../constants';
import { useGetOscapCustomizationsQuery } from '../../../store/imageBuilderApi';

const OscapProfileInformation = (): JSX.Element => {
  const { getState } = useFormApi();

  const oscapProfile = getState()?.values?.['oscap-profile'];

  const {
    data: oscapProfileInfo,
    isFetching: isFetchingOscapProfileInfo,
    isSuccess: isSuccessOscapProfileInfo,
  } = useGetOscapCustomizationsQuery(
    { distribution: getState()?.values?.['release'], profile: oscapProfile },
    {
      skip: !oscapProfile,
    }
  );

  return (
    <>
      {isFetchingOscapProfileInfo && <Spinner size="lg" />}
      {isSuccessOscapProfileInfo && (
        <TextContent>
          <br />
          <TextList component={TextListVariants.dl}>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Profile description:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {oscapProfileInfo.openscap?.profile_description}
            </TextListItem>
          </TextList>
          <TextList component={TextListVariants.dl}>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Operating system:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {RELEASES.get(getState()?.values?.['release'])}
            </TextListItem>
          </TextList>
          <TextList component={TextListVariants.dl}>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Reference ID:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {oscapProfileInfo.openscap?.profile_id}
            </TextListItem>
          </TextList>
        </TextContent>
      )}
    </>
  );
};

export default OscapProfileInformation;
