import React from 'react';

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
  FormGroup,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import ActivationKeyInformation from './../Registration/ActivationKeyInformation';
import { PackagesTable, RepositoriesTable } from './ReviewStepTables';
import { FSReviewTable } from './ReviewStepTables';

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
  selectFileSystemPartitionMode,
  selectRecommendedRepositories,
} from '../../../../store/wizardSlice';
import { toMonthAndYear } from '../../../../Utilities/time';
import { MinimumSizePopover } from '../FileSystem/FileSystemTable';
import { MajorReleasesLifecyclesChart } from '../ImageOutput/ReleaseLifecycle';
import OscapProfileInformation from '../Oscap/OscapProfileInformation';
import { PopoverActivation } from '../Registration/ActivationKeysList';

const ExpirationWarning = () => {
  return (
    <div className="pf-u-mr-sm pf-u-font-size-sm pf-v5-u-warning-color-200">
      <ExclamationTriangleIcon /> Expires 14 days after creation
    </div>
  );
};

export const ImageOutputList = () => {
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
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
  const fileSystemPartitionMode = useAppSelector(selectFileSystemPartitionMode);

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Configuration type
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dd}
          data-testid="partitioning-auto-manual"
        >
          {fileSystemPartitionMode === 'manual' ? 'Manual' : 'Automatic'}
          {fileSystemPartitionMode === 'manual' && (
            <>
              {' '}
              <Popover
                position="bottom"
                headerContent="Partitions"
                hasAutoWidth
                minWidth="30rem"
                bodyContent={<FSReviewTable />}
              >
                <Button
                  data-testid="file-system-configuration-popover"
                  variant="link"
                  aria-label="File system configuration info"
                  aria-describedby="file-system-configuration-info"
                  className="pf-u-pt-0 pf-u-pb-0"
                >
                  View partitions
                </Button>
              </Popover>
            </>
          )}
        </TextListItem>
        {fileSystemPartitionMode === 'manual' && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Image size (minimum) <MinimumSizePopover />
            </TextListItem>
            <MinSize />
          </>
        )}
      </TextList>
      <br />
    </TextContent>
  );
};

export const MinSize = () => {
  return <TextListItem component={TextListItemVariants.dd} />;
};

export const TargetEnvAWSList = () => {
  const { isSuccess } = useGetSourceListQuery({
    provider: 'aws',
  });
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const awsShareMethod = useAppSelector(selectAwsShareMethod);
  const sourceId = useAppSelector(selectAwsSourceId);
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
  const accountType = useAppSelector(selectGcpAccountType);
  const sharedMethod = useAppSelector(selectGcpShareMethod);
  const email = useAppSelector(selectGcpEmail);
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
  const shareMethod = useAppSelector(selectAzureShareMethod);
  const tenantId = useAppSelector(selectAzureTenantId);
  const azureSource = useAppSelector(selectAzureSource);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);

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
  const customRepositories = useAppSelector(selectCustomRepositories);
  const packages = useAppSelector(selectPackages);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const duplicatePackages = packages.filter(
    (item, index) => packages.indexOf(item) !== index
  );
  return (
    <>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <TextListItem component={TextListItemVariants.dt}>
            Custom repositories
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            data-testid="custom-repositories-count"
          >
            {customRepositories?.length + recommendedRepositories.length > 0 ? (
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
                  {customRepositories?.length +
                    recommendedRepositories.length || 0}
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
      </TextContent>
      <br />
      {duplicatePackages.length > 0 && (
        <Alert
          title="Can not guarantee where some selected packages will come from"
          variant="warning"
          isInline
        >
          Some of the packages added to this image belong to multiple added
          repositories. We can not guarantee which repository the package will
          come from.
        </Alert>
      )}

      <br />
    </>
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
  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);

  const { isError } = useShowActivationKeyQuery(
    // @ts-ignore type of 'activationKey' might not be strictly compatible with the expected type for 'name'.
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
            Activation key <PopoverActivation />
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
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

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
