import React from 'react';

import { useFormApi } from '@data-driven-forms/react-form-renderer';
import {
  Spinner,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  CodeBlock,
  CodeBlockCode,
  Alert,
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

  const enabledServicesDisplayString =
    oscapProfileInfo?.services?.enabled?.join(' ');
  const maskedServicesDisplayString =
    oscapProfileInfo?.services?.masked?.join(' ');

  return (
    <>
      {isFetchingOscapProfileInfo && <Spinner size="lg" />}
      {isSuccessOscapProfileInfo && (
        <>
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
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
              >
                Operating system:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {RELEASES.get(getState()?.values?.['release'])}
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
              >
                Reference ID:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {oscapProfileInfo.openscap?.profile_id}
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
              >
                Kernel arguments:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <CodeBlock>
                  <CodeBlockCode>
                    {oscapProfileInfo?.kernel?.append}
                  </CodeBlockCode>
                </CodeBlock>
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
              >
                Disabled services:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <CodeBlock>
                  <CodeBlockCode>{maskedServicesDisplayString}</CodeBlockCode>
                </CodeBlock>
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
              >
                Enabled services:
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                <CodeBlock>
                  <CodeBlockCode>{enabledServicesDisplayString}</CodeBlockCode>
                </CodeBlock>
              </TextListItem>
            </TextList>
          </TextContent>

          <Alert
            variant="info"
            isInline
            isPlain
            title="Additional customizations"
          >
            Selecting an OpenSCAP profile will cause the appropriate packages,
            file system configuration, kernel arguments, and services to be
            added to your image.
          </Alert>
        </>
      )}
    </>
  );
};

export default OscapProfileInformation;
