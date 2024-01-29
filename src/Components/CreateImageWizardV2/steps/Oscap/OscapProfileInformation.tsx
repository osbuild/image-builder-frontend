import React from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  Spinner,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../store/imageBuilderApi';
import {
  selectDistribution,
  selectProfile,
} from '../../../../store/wizardSlice';

const OscapProfileInformation = (): JSX.Element => {
  const release = useAppSelector((state) => selectDistribution(state));
  const oscapProfile = useAppSelector((state) => selectProfile(state));
  const {
    data: oscapProfileInfo,
    isFetching: isFetchingOscapProfileInfo,
    isSuccess: isSuccessOscapProfileInfo,
  } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if oscapProfile is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: oscapProfile,
    },
    {
      skip: !oscapProfile,
    }
  );

  const enabledServices = oscapProfileInfo?.services?.enabled;
  const enabledServicesDisplayString = enabledServices?.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue, '');
  const disableServices = oscapProfileInfo?.services?.disabled;
  const disableServicesDisplayString = disableServices?.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue, '');
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
              {RELEASES.get(release)}
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

            <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
            >
              Kernel:
            </TextListItem>
                <TextListItem component={TextListItemVariants.dd}>
              <CodeBlock>
                <CodeBlockCode id="code-content">{oscapProfileInfo?.kernel?.append}
                </CodeBlockCode>
              </CodeBlock>
            </TextListItem>
            <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
            >
              Disabled Services:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              <CodeBlock>
                <CodeBlockCode id="code-content">
                 {disableServicesDisplayString}

                </CodeBlockCode>
              </CodeBlock>
            </TextListItem>

            <TextListItem
                component={TextListItemVariants.dt}
                className="pf-u-min-width"
            >
              Enabled Services:
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              <CodeBlock>
                <CodeBlockCode id="code-content">
                  {enabledServicesDisplayString}
                </CodeBlockCode>
              </CodeBlock>
            </TextListItem>
          </TextList>
        </TextContent>
      )}
    </>
  );
};

export default OscapProfileInformation;
