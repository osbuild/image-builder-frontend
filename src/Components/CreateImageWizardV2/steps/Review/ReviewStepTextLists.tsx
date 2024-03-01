import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Popover,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  TextVariants,
  Spinner,
  FormGroup,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, HelpIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import ActivationKeyInformation from './../Registration/ActivationKeyInformation';
import { PackagesTable, RepositoriesTable } from './ReviewStepTables';

import {
  RELEASES,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
} from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { useGetSourceListQuery } from '../../../../store/provisioningApi';
import { useShowActivationKeyQuery } from '../../../../store/rhsmApi';
import {
  selectActivationKey,
  selectArchitecture,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAzureShareMethod,
  selectAzureSource,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectAwsSourceId,
  selectBlueprintDescription,
  selectBlueprintName,
  selectCustomRepositories,
  selectDistribution,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectPackages,
  selectRegistrationType,
} from '../../../../store/wizardSlice';
import { toMonthAndYear } from '../../../../Utilities/time';
import { MajorReleasesLifecyclesChart } from '../../../CreateImageWizard/formComponents/ReleaseLifecycle';
import OscapProfileInformation from '../Oscap/OscapProfileInformation';

const ExpirationWarning = () => {
  return (
    <div className="pf-u-mr-sm pf-u-font-size-sm pf-u-warning-color-100">
      <ExclamationTriangleIcon /> Expires 14 days after creation
    </div>
  );
};

export const ImageOutputList = () => {
  const distribution = useAppSelector((state) => selectDistribution(state));
  const arch = useAppSelector((state) => selectArchitecture(state));
  return (
    <TextContent>
      {distribution === RHEL_8 && (
        <>
          <Text className="pf-v5-u-font-size-sm">
            {RELEASES.get(distribution)} will be supported through{' '}
            {toMonthAndYear(RHEL_8_FULL_SUPPORT[1])}, with optional ELS support
            through {toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[1])}. Consider
            building an image with {RELEASES.get(RHEL_9)} to extend the support
            period.
          </Text>
          <FormGroup label="Release lifecycle">
            <MajorReleasesLifecyclesChart />
          </FormGroup>
          <br />
        </>
      )}
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Release
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {RELEASES.get(distribution)}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Architecture
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{arch}</TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};
export const FSCList = () => {
  return (
    <TextContent>
      <br />
    </TextContent>
  );
};

export const TargetEnvAWSList = () => {
  const { isSuccess } = useGetSourceListQuery({
    provider: 'aws',
  });
  const awsAccountId = useAppSelector((state) => selectAwsAccountId(state));
  const awsShareMethod = useAppSelector((state) => selectAwsShareMethod(state));
  const sourceId = useAppSelector((state) => selectAwsSourceId(state));
  const { source } = useGetSourceListQuery(
    {
      provider: 'aws',
    },
    {
      selectFromResult: ({ data }) => ({
        source: data?.data?.find((source) => source.id === sourceId),
      }),
    }
  );

  return (
    <TextContent>
      <Text component={TextVariants.h3}>AWS</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Shared to account
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {awsAccountId}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          {awsShareMethod === 'sources' ? 'Source' : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {isSuccess && awsShareMethod === 'sources' ? source?.name : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Default region
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          us-east-1
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvGCPList = () => {
  const accountType = useAppSelector((state) => selectGcpAccountType(state));
  const sharedMethod = useAppSelector((state) => selectGcpShareMethod(state));
  const email = useAppSelector((state) => selectGcpEmail(state));
  return (
    <TextContent>
      <Text component={TextVariants.h3}>GCP</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        <>
          {sharedMethod === 'withInsights' ? (
            <>
              <TextListItem component={TextListItemVariants.dt}>
                Shared with
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Red Hat Insights only
                <br />
              </TextListItem>
            </>
          ) : (
            <>
              <TextListItem component={TextListItemVariants.dt}>
                Account type
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {accountType === 'group'
                  ? 'Google group'
                  : accountType === 'serviceAccount'
                  ? 'Service account'
                  : accountType === 'user'
                  ? 'Google account'
                  : 'Domain'}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {accountType === 'domain' ? 'Domain' : 'Principal'}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {email || accountType}
              </TextListItem>
            </>
          )}
        </>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvAzureList = () => {
  const { data: rawAzureSources, isSuccess: isSuccessAzureSources } =
    useGetSourceListQuery({ provider: 'azure' });
  const shareMethod = useAppSelector((state) => selectAzureShareMethod(state));
  const tenantId = useAppSelector((state) => selectAzureTenantId(state));
  const azureSource = useAppSelector((state) => selectAzureSource(state));
  const azureResourceGroup = useAppSelector((state) =>
    selectAzureResourceGroup(state)
  );
  const subscriptionId = useAppSelector((state) =>
    selectAzureSubscriptionId(state)
  );

  return (
    <TextContent>
      <Text component={TextVariants.h3}>Microsoft Azure</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        {shareMethod === 'sources' && isSuccessAzureSources && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Azure Source
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {
                rawAzureSources.data?.find(
                  (source) => source.id === azureSource
                )?.name
              }
            </TextListItem>
          </>
        )}
        {shareMethod === 'manual' && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Azure Tenant ID
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {tenantId}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              Subscription ID
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {subscriptionId}
            </TextListItem>
          </>
        )}
        <TextListItem component={TextListItemVariants.dt}>
          Resource group
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {azureResourceGroup}
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvOciList = () => {
  return (
    <TextContent>
      <Text component={TextVariants.h3}>Oracle Cloud Infrastructure</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Object Storage URL
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          The URL for the built image will be ready to copy
          <br />
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvOtherList = () => {
  return (
    <>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Built image will be available for download
        </TextListItem>
      </TextList>
      <br />
    </>
  );
};

export const ContentList = () => {
  const customRepositories = useAppSelector((state) =>
    selectCustomRepositories(state)
  );
  const packages = useAppSelector((state) => selectPackages(state));
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem component={TextListItemVariants.dt}>
          Custom repositories
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dd}
          data-testid="custom-repositories-count"
        >
          {customRepositories?.length > 0 ? (
            <Popover
              position="bottom"
              headerContent="Custom repositories"
              hasAutoWidth
              minWidth="30rem"
              bodyContent={<RepositoriesTable />}
            >
              <Button
                variant="link"
                aria-label="About custom repositories"
                className="pf-u-p-0"
              >
                {customRepositories?.length || 0}
              </Button>
            </Popover>
          ) : (
            0
          )}
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Additional packages
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dd}
          data-testid="chosen-packages-count"
        >
          {packages?.length > 0 ? (
            <Popover
              position="bottom"
              headerContent="Additional packages"
              hasAutoWidth
              minWidth="60rem"
              bodyContent={<PackagesTable />}
            >
              <Button
                variant="link"
                aria-label="About packages"
                className="pf-u-p-0"
              >
                {packages?.length}
              </Button>
            </Popover>
          ) : (
            0
          )}
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const RegisterLaterList = () => {
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Registration type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Register the system later
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const RegisterNowList = () => {
  const activationKey = useAppSelector((state) => selectActivationKey(state));
  const registrationType = useAppSelector((state) =>
    selectRegistrationType(state)
  );
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const { auth } = useChrome();

  useEffect(() => {
    (async () => {
      const userData = await auth?.getUser();
      const id = userData?.identity?.internal?.org_id;
      setOrgId(id);
    })();
  });
  const { isError } = useShowActivationKeyQuery(
    // @ts-ignore - type of 'activationKey' might not be strictly compatible with the expected type for 'name'.
    { name: activationKey },
    {
      skip: !activationKey,
    }
  );
  return (
    <>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-u-min-width"
          >
            Registration type
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            data-testid="review-registration"
          >
            <TextList isPlain>
              {registrationType?.startsWith('register-now') && (
                <TextListItem>
                  Register with Red Hat Subscription Manager (RHSM)
                  <br />
                </TextListItem>
              )}
              {(registrationType === 'register-now-insights' ||
                registrationType === 'register-now-rhc') && (
                <TextListItem>
                  Connect to Red Hat Insights
                  <br />
                </TextListItem>
              )}
              {registrationType === 'register-now-rhc' && (
                <TextListItem>
                  Use remote host configuration (rhc) utility
                  <br />
                </TextListItem>
              )}
            </TextList>
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>
            Activation key
            <Popover
              bodyContent={
                <TextContent>
                  <Text>
                    Activation keys enable you to register a system with
                    appropriate subscriptions, system purpose, and repositories
                    attached.
                    <br />
                    <br />
                    If using an activation key with command line registration,
                    you must provide your organization&apos;s ID. Your
                    organization&apos;s ID is{' '}
                    {orgId !== undefined ? orgId : <Spinner size="md" />}
                  </Text>
                </TextContent>
              }
            >
              <Button
                variant="plain"
                aria-label="About activation key"
                className="pf-u-pl-sm pf-u-pt-0 pf-u-pb-0"
                size="sm"
              >
                <HelpIcon />
              </Button>
            </Popover>
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <ActivationKeyInformation />
          </TextListItem>
        </TextList>
        <br />
      </TextContent>
      {isError && (
        <Alert
          title="Information about the activation key unavailable"
          variant="danger"
          isPlain
          isInline
        >
          Information about the activation key cannot be loaded. Please check
          the key was not removed and try again later.
        </Alert>
      )}
    </>
  );
};

export const ImageDetailsList = () => {
  const blueprintName = useAppSelector((state) => selectBlueprintName(state));
  const blueprintDescription = useAppSelector((state) =>
    selectBlueprintDescription(state)
  );

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        {blueprintName && (
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Image name
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {blueprintName}
            </TextListItem>
          </>
        )}
        {blueprintDescription && (
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Description
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {blueprintDescription}
            </TextListItem>
          </>
        )}
      </TextList>
      <br />
    </TextContent>
  );
};

export const OscapList = () => {
  return <OscapProfileInformation />;
};
