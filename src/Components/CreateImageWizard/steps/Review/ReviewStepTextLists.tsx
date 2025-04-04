import React, { useEffect, useMemo } from 'react';

import {
  Alert,
  Button,
  Popover,
  Content,
  ContentVariants,
  FormGroup,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import ActivationKeyInformation from './../Registration/ActivationKeyInformation';
import {
  PackagesTable,
  RepositoriesTable,
  SnapshotTable,
} from './ReviewStepTables';
import { FSReviewTable } from './ReviewStepTables';

import {
  FEDORA_RELEASES,
  ON_PREM_RELEASES,
  RELEASES,
  RHEL_8,
  RHEL_8_FULL_SUPPORT,
  RHEL_8_MAINTENANCE_SUPPORT,
  RHEL_9,
  targetOptions,
  UNIT_GIB,
} from '../../../../constants';
import { useListSnapshotsByDateMutation } from '../../../../store/contentSourcesApi';
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
  selectGroups,
  selectRegistrationType,
  selectFileSystemConfigurationType,
  selectRecommendedRepositories,
  selectSnapshotDate,
  selectUseLatest,
  selectPartitions,
  selectFirstBootScript,
  selectTimezone,
  selectNtpServers,
  selectLanguages,
  selectKeyboard,
  selectHostname,
  selectUserNameByIndex,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  selectKernel,
  selectUserAdministrator,
  selectFirewall,
  selectServices,
} from '../../../../store/wizardSlice';
import { toMonthAndYear, yyyyMMddFormat } from '../../../../Utilities/time';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';
import {
  getConversionFactor,
  MinimumSizePopover,
  Partition,
} from '../FileSystem/FileSystemTable';
import { MajorReleasesLifecyclesChart } from '../ImageOutput/ReleaseLifecycle';
import OscapProfileInformation from '../Oscap/components/OscapProfileInformation';
import PopoverActivation from '../Registration/components/PopoverActivation';

const ExpirationWarning = () => {
  return (
    <div className="pf-v5-u-mr-sm pf-v5-u-font-size-sm pf-v5-u-warning-color-200">
      <ExclamationTriangleIcon /> Expires 14 days after creation
    </div>
  );
};

export const ImageOutputList = () => {
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const { isFedoraEnv } = useGetEnvironment();
  const releases = isFedoraEnv
    ? FEDORA_RELEASES
    : process.env.IS_ON_PREMISE
    ? ON_PREM_RELEASES
    : RELEASES;
  return (
    <Content>
      {distribution === RHEL_8 && (
        <>
          <Content component="p" className="pf-v5-u-font-size-sm">
            {RELEASES.get(distribution)} will be supported through{' '}
            {toMonthAndYear(RHEL_8_FULL_SUPPORT[1])}, with optional ELS support
            through {toMonthAndYear(RHEL_8_MAINTENANCE_SUPPORT[1])}. Consider
            building an image with {RELEASES.get(RHEL_9)} to extend the support
            period.
          </Content>
          <FormGroup label="Release lifecycle">
            <MajorReleasesLifecyclesChart />
          </FormGroup>
          <br />
        </>
      )}
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Release
        </Content>
        <Content component={ContentVariants.dd}>
          {releases.get(distribution)}
        </Content>
        <Content component={ContentVariants.dt}>Architecture</Content>
        <Content component={ContentVariants.dd}>{arch}</Content>
      </Content>
    </Content>
  );
};
export const FSCList = () => {
  const fileSystemConfigurationType = useAppSelector(
    selectFileSystemConfigurationType
  );
  const partitions = useAppSelector(selectPartitions);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Configuration type
        </Content>
        <Content
          component={ContentVariants.dd}
          data-testid="partitioning-auto-manual"
        >
          {fileSystemConfigurationType === 'manual' ? 'Manual' : 'Automatic'}
          {fileSystemConfigurationType === 'manual' && (
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
                  className="pf-v5-u-pt-0 pf-v5-u-pb-0"
                >
                  View partitions
                </Button>
              </Popover>
            </>
          )}
        </Content>
        {fileSystemConfigurationType === 'manual' && (
          <>
            <Content component={ContentVariants.dt}>
              Image size (minimum) <MinimumSizePopover />
            </Content>
            <MinSize partitions={partitions} />
          </>
        )}
      </Content>
    </Content>
  );
};

type MinSizeProps = {
  partitions: Partition[];
};

export const MinSize = ({ partitions }: MinSizeProps) => {
  let minSize = '';
  if (partitions) {
    let size = 0;
    for (const partition of partitions) {
      size += Number(partition.min_size) * getConversionFactor(partition.unit);
    }

    size = Number((size / UNIT_GIB).toFixed(1));
    if (size < 1) {
      minSize = `Less than 1 GiB`;
    } else {
      minSize = `${size} GiB`;
    }
  }

  return <Content component={ContentVariants.dd}> {minSize} </Content>;
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
    <Content>
      <Content component={ContentVariants.h3}>{targetOptions.aws}</Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Image type
        </Content>
        <Content component={ContentVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </Content>
        <Content component={ContentVariants.dt}>Shared to account</Content>
        <Content component={ContentVariants.dd}>{awsAccountId}</Content>
        <Content component={ContentVariants.dt}>
          {awsShareMethod === 'sources' ? 'Source' : null}
        </Content>
        <Content component={ContentVariants.dd}>
          {isSuccess && awsShareMethod === 'sources' ? source?.name : null}
        </Content>
        <Content component={ContentVariants.dt}>Default region</Content>
        <Content component={ContentVariants.dd}>us-east-1</Content>
      </Content>
    </Content>
  );
};

export const TargetEnvGCPList = () => {
  const accountType = useAppSelector(selectGcpAccountType);
  const sharedMethod = useAppSelector(selectGcpShareMethod);
  const email = useAppSelector(selectGcpEmail);
  return (
    <Content>
      <Content component={ContentVariants.h3}>{targetOptions.gcp}</Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Image type
        </Content>
        <Content component={ContentVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </Content>
        <>
          {sharedMethod === 'withInsights' ? (
            <>
              <Content component={ContentVariants.dt}>Shared with</Content>
              <Content component={ContentVariants.dd}>
                Red Hat Insights only
                <br />
              </Content>
            </>
          ) : (
            <>
              <Content component={ContentVariants.dt}>Account type</Content>
              <Content component={ContentVariants.dd}>
                {accountType === 'group'
                  ? 'Google group'
                  : accountType === 'serviceAccount'
                  ? 'Service account'
                  : accountType === 'user'
                  ? 'Google account'
                  : 'Domain'}
              </Content>
              <Content component={ContentVariants.dt}>
                {accountType === 'domain' ? 'Domain' : 'Principal'}
              </Content>
              <Content component={ContentVariants.dd}>
                {email || accountType}
              </Content>
            </>
          )}
        </>
      </Content>
    </Content>
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
    <Content>
      <Content component={ContentVariants.h3}>{targetOptions.azure}</Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Image type
        </Content>
        <Content component={ContentVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </Content>
        {shareMethod === 'sources' && isSuccessAzureSources && (
          <>
            <Content component={ContentVariants.dt}>Azure Source</Content>
            <Content component={ContentVariants.dd}>
              {
                rawAzureSources?.data?.find(
                  (source) => source.id === azureSource
                )?.name
              }
            </Content>
          </>
        )}
        {shareMethod === 'manual' && (
          <>
            <Content component={ContentVariants.dt}>Azure tenant ID</Content>
            <Content component={ContentVariants.dd}>{tenantId}</Content>
            <Content component={ContentVariants.dt}>Subscription ID</Content>
            <Content component={ContentVariants.dd}>{subscriptionId}</Content>
          </>
        )}
        <Content component={ContentVariants.dt}>Resource group</Content>
        <Content component={ContentVariants.dd}>{azureResourceGroup}</Content>
      </Content>
    </Content>
  );
};

export const TargetEnvOciList = () => {
  return (
    <Content>
      <Content component={ContentVariants.h3}>{targetOptions.oci}</Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Object Storage URL
        </Content>
        <Content component={ContentVariants.dd}>
          The URL for the built image will be ready to copy
        </Content>
      </Content>
    </Content>
  );
};

export const TargetEnvOtherList = () => {
  return (
    <>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Image type
        </Content>
        <Content component={ContentVariants.dd}>
          Built image will be available for download
        </Content>
      </Content>
    </>
  );
};

export const ContentList = () => {
  const customRepositories = useAppSelector(selectCustomRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);

  const customAndRecommendedRepositoryUUIDS = useMemo(
    () =>
      [
        ...customRepositories.map(({ id }) => id),
        ...recommendedRepositories.map(({ uuid }) => uuid),
      ] as string[],
    [customRepositories, recommendedRepositories]
  );

  const [listSnapshotsByDate, { data, isSuccess, isLoading, isError }] =
    useListSnapshotsByDateMutation();

  useEffect(() => {
    listSnapshotsByDate({
      apiListSnapshotByDateRequest: {
        repository_uuids: customAndRecommendedRepositoryUUIDS,
        date: useLatest ? yyyyMMddFormat(new Date()) : snapshotDate,
      },
    });
  }, [
    customAndRecommendedRepositoryUUIDS,
    listSnapshotsByDate,
    snapshotDate,
    useLatest,
  ]);

  const duplicatePackages = packages.filter(
    (item, index) => packages.indexOf(item) !== index
  );

  const noRepositoriesSelected =
    customAndRecommendedRepositoryUUIDS.length === 0;

  const hasSnapshotDateAfter = data?.data?.some(({ is_after }) => is_after);

  const snapshottingText = useMemo(() => {
    switch (true) {
      case isLoading:
        return '';
      case useLatest:
        return 'Use latest';
      case !!snapshotDate:
        return `State as of ${yyyyMMddFormat(new Date(snapshotDate))}`;
      default:
        return '';
    }
  }, [isLoading, useLatest, snapshotDate]);

  return (
    <>
      <Content>
        <Content component={ContentVariants.dl}>
          <>
            <Content
              component={ContentVariants.dt}
              className="pf-v5-u-min-width"
            >
              Repeatable build
            </Content>
            <Content
              component={ContentVariants.dd}
              data-testid="snapshot-method"
            >
              <Popover
                position="bottom"
                headerContent={
                  useLatest
                    ? 'Use the latest repository content'
                    : `Repositories as of ${yyyyMMddFormat(
                        new Date(snapshotDate)
                      )}`
                }
                hasAutoWidth
                minWidth="60rem"
                bodyContent={
                  <SnapshotTable snapshotForDate={data?.data || []} />
                }
              >
                <Button
                  variant="link"
                  aria-label="Snapshot method"
                  className="pf-v5-u-p-0"
                  isDisabled={noRepositoriesSelected || isLoading || isError}
                  isLoading={isLoading}
                >
                  {snapshottingText}
                </Button>
              </Popover>
              {!useLatest && !isLoading && isSuccess && hasSnapshotDateAfter ? (
                <Alert
                  variant="warning"
                  isInline
                  isPlain
                  title="A snapshot for this date is not available for some repositories."
                />
              ) : (
                ''
              )}
            </Content>
          </>
          <Content component={ContentVariants.dt}>Custom repositories</Content>
          <Content
            component={ContentVariants.dd}
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
                  className="pf-v5-u-p-0"
                >
                  {customRepositories?.length +
                    recommendedRepositories.length || 0}
                </Button>
              </Popover>
            ) : (
              0
            )}
          </Content>
          <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
            Additional packages
          </Content>
          <Content
            component={ContentVariants.dd}
            data-testid="chosen-packages-count"
          >
            {packages?.length > 0 || groups?.length > 0 ? (
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
                  className="pf-v5-u-p-0"
                >
                  {packages?.length + groups?.length}
                </Button>
              </Popover>
            ) : (
              0
            )}
          </Content>
        </Content>
      </Content>
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
    </>
  );
};

export const RegisterLaterList = () => {
  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Registration type
        </Content>
        <Content component={ContentVariants.dd}>
          Register the system later
        </Content>
      </Content>
    </Content>
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
      <Content>
        <Content component={ContentVariants.dl}>
          <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
            Registration type
          </Content>
          <Content
            component={ContentVariants.dd}
            data-testid="review-registration"
          >
            <Content component="ul" isPlainList>
              {registrationType?.startsWith('register-now') && (
                <Content component="li">
                  Register with Red Hat Subscription Manager (RHSM)
                  <br />
                </Content>
              )}
              {(registrationType === 'register-now-insights' ||
                registrationType === 'register-now-rhc') && (
                <Content component="li">
                  Connect to Red Hat Insights
                  <br />
                </Content>
              )}
              {registrationType === 'register-now-rhc' && (
                <Content component="li">
                  Use remote host configuration (rhc) utility
                  <br />
                </Content>
              )}
            </Content>
          </Content>
          <Content component={ContentVariants.dt}>
            Activation key <PopoverActivation />
          </Content>
          <Content component={ContentVariants.dd}>
            <ActivationKeyInformation />
          </Content>
        </Content>
      </Content>
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

export const DetailsList = () => {
  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        {blueprintName && (
          <>
            <Content
              component={ContentVariants.dt}
              className="pf-v5-u-min-width"
            >
              Blueprint name
            </Content>
            <Content component={ContentVariants.dd}>{blueprintName}</Content>
          </>
        )}
        {blueprintDescription && (
          <>
            <Content
              component={ContentVariants.dt}
              className="pf-v5-u-min-width"
            >
              Description
            </Content>
            <Content component={ContentVariants.dd}>
              {blueprintDescription}
            </Content>
          </>
        )}
      </Content>
    </Content>
  );
};

export const OscapList = () => {
  return <OscapProfileInformation allowChangingCompliancePolicy={true} />;
};

export const TimezoneList = () => {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Timezone
        </Content>
        <Content component={ContentVariants.dd}>
          {timezone ? timezone : 'None'}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          NTP servers
        </Content>
        <Content component={ContentVariants.dd}>
          {ntpServers && ntpServers.length > 0 ? ntpServers.join(', ') : 'None'}
        </Content>
      </Content>
    </Content>
  );
};

export const UsersList = () => {
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const userIsAdministratorSelector = selectUserAdministrator(index);
  const userIsAdministrator = useAppSelector(userIsAdministratorSelector);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <>
          <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
            Username
          </Content>
          <Content component={ContentVariants.dd}>
            {userName ? userName : 'None'}
          </Content>
          <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
            Password
          </Content>
          <Content component={ContentVariants.dd}>
            {userPassword ? '●'.repeat(8) : 'None'}
          </Content>
          <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
            SSH key
          </Content>
          <Content component={ContentVariants.dd}>
            {userSshKey ? userSshKey : 'None'}
          </Content>
          <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
            Administrator
          </Content>
          <Content component={ContentVariants.dd}>
            {userIsAdministrator ? 'True' : 'False'}
          </Content>
        </>
      </Content>
    </Content>
  );
};

export const LocaleList = () => {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Languages
        </Content>
        <Content component={ContentVariants.dd}>
          {languages && languages.length > 0 ? languages.join(', ') : 'None'}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Keyboard
        </Content>
        <Content component={ContentVariants.dd}>
          {keyboard ? keyboard : 'None'}
        </Content>
      </Content>
    </Content>
  );
};

export const HostnameList = () => {
  const hostname = useAppSelector(selectHostname);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Hostname
        </Content>
        <Content component={ContentVariants.dd}>
          {hostname ? hostname : 'None'}
        </Content>
      </Content>
    </Content>
  );
};

export const KernelList = () => {
  const kernel = useAppSelector(selectKernel);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Name
        </Content>
        <Content component={ContentVariants.dd}>
          {kernel.name ? kernel.name : 'None'}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Append
        </Content>
        <Content component={ContentVariants.dd}>
          {kernel.append.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{kernel.append.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
      </Content>
    </Content>
  );
};

export const FirewallList = () => {
  const firewall = useAppSelector(selectFirewall);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Ports
        </Content>
        <Content component={ContentVariants.dd}>
          {firewall.ports.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{firewall.ports.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Disabled services
        </Content>
        <Content component={ContentVariants.dd}>
          {firewall.services.disabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>
                {firewall.services.disabled.join(' ')}
              </CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Enabled services
        </Content>
        <Content component={ContentVariants.dd}>
          {firewall.services.enabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>
                {firewall.services.enabled.join(' ')}
              </CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
      </Content>
    </Content>
  );
};

export const ServicesList = () => {
  const services = useAppSelector(selectServices);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Disabled
        </Content>
        <Content component={ContentVariants.dd}>
          {services.disabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{services.disabled.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Masked
        </Content>
        <Content component={ContentVariants.dd}>
          {services.masked.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{services.masked.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          Enabled
        </Content>
        <Content component={ContentVariants.dd}>
          {services.enabled.length > 0 ? (
            <CodeBlock>
              <CodeBlockCode>{services.enabled.join(' ')}</CodeBlockCode>
            </CodeBlock>
          ) : (
            'None'
          )}
        </Content>
      </Content>
    </Content>
  );
};

export const FirstBootList = () => {
  const isFirstbootEnabled = !!useAppSelector(selectFirstBootScript);

  return (
    <Content>
      <Content component={ContentVariants.dl}>
        <Content component={ContentVariants.dt} className="pf-v5-u-min-width">
          First boot script
        </Content>
        <Content component={ContentVariants.dd}>
          {isFirstbootEnabled ? 'Enabled' : 'Disabled'}
        </Content>
      </Content>
    </Content>
  );
};
