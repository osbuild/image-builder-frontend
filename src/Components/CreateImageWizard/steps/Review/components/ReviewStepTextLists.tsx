import React, { useEffect, useMemo } from 'react';

import {
  Alert,
  Button,
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  Icon,
  Popover,
} from '@patternfly/react-core';
import { CheckCircleIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { UNIT_GIB } from '@/constants';
import {
  useGetTemplateQuery,
  useListSnapshotsByDateMutation,
} from '@/store/api/contentSources';
import { useShowActivationKeyQuery } from '@/store/api/rhsm';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  selectAapCallbackUrl,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
  selectActivationKey,
  selectCustomRepositories,
  selectFilesystemPartitions,
  selectFirewall,
  selectFirstBootScript,
  selectFscMode,
  selectGroups,
  selectHostname,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectNtpServers,
  selectOrgId,
  selectPackages,
  selectRecommendedRepositories,
  selectRedHatRepositories,
  selectRegistrationType,
  selectServices,
  selectSnapshotDate,
  selectTemplate,
  selectTimezone,
  selectUseLatest,
  selectUsers,
  UserGroup,
} from '@/store/slices/wizard';

import {
  DiskReviewTable,
  FSReviewTable,
  PackagesTable,
  RepositoriesTable,
  SnapshotTable,
  UserGroupsTable,
} from './ReviewStepTables';

import { useAppSelector } from '../../../../../store/hooks';
import { yyyyMMddFormat } from '../../../../../Utilities/time';
import MinimumSizePopover from '../../FileSystem/components/MinimumSizePopover';
import { FilesystemPartition } from '../../FileSystem/fscTypes';
import { getConversionFactor } from '../../FileSystem/fscUtilities';

export const FSCList = () => {
  const fscMode = useAppSelector(selectFscMode);
  const partitions = useAppSelector(selectFilesystemPartitions);

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Configuration type
        </Content>
        <Content component={ContentVariants.dd}>
          {fscMode === 'basic'
            ? 'Basic'
            : fscMode === 'advanced'
              ? 'Advanced'
              : 'Automatic'}
          {fscMode === 'basic' && (
            <>
              {' '}
              <Popover
                position='bottom'
                headerContent='Partitions'
                hasAutoWidth
                minWidth='30rem'
                bodyContent={<FSReviewTable />}
              >
                <Button variant='link' className='pf-v6-u-pt-0 pf-v6-u-pb-0'>
                  View partitions
                </Button>
              </Popover>
            </>
          )}
          {fscMode === 'advanced' && (
            <>
              {' '}
              <Popover
                position='bottom'
                hasAutoWidth
                minWidth='50rem'
                bodyContent={<DiskReviewTable />}
              >
                <Button variant='link' className='pf-v6-u-pt-0 pf-v6-u-pb-0'>
                  View partitions
                </Button>
              </Popover>
            </>
          )}
        </Content>
        {fscMode === 'basic' && (
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
  partitions: FilesystemPartition[];
};

export const MinSize = ({ partitions }: MinSizeProps) => {
  let minSize = '';
  if (partitions.length > 0) {
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

export const TargetEnvOtherList = () => {
  return (
    <>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const customRepositories = useAppSelector(selectCustomRepositories);
  const packages = useAppSelector(selectPackages);
  const groups = useAppSelector(selectGroups);
  const recommendedRepositories = useAppSelector(selectRecommendedRepositories);
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);
  const template = useAppSelector(selectTemplate);
  const redHatRepositories = useAppSelector(selectRedHatRepositories);

  const customAndRecommendedRepositoryUUIDS = useMemo(
    () =>
      [
        ...customRepositories.map(({ id }) => id),
        ...recommendedRepositories.map(({ uuid }) => uuid),
      ] as string[],
    [customRepositories, recommendedRepositories],
  );

  const [listSnapshotsByDate, { data, isSuccess, isLoading }] =
    useListSnapshotsByDateMutation();

  useEffect(() => {
    if (!snapshotDate && !useLatest) return;

    listSnapshotsByDate({
      apiListSnapshotByDateRequest: {
        repository_uuids: customAndRecommendedRepositoryUUIDS,
        date: useLatest
          ? yyyyMMddFormat(new Date()) + 'T00:00:00Z'
          : snapshotDate,
      },
    });
  }, [
    customAndRecommendedRepositoryUUIDS,
    listSnapshotsByDate,
    snapshotDate,
    useLatest,
  ]);

  const duplicatePackages = packages.filter(
    (item, index) => packages.indexOf(item) !== index,
  );

  const noRepositoriesSelected =
    customAndRecommendedRepositoryUUIDS.length === 0 &&
    redHatRepositories.length === 0;

  const hasSnapshotDateAfter = data?.data?.some(({ is_after }) => is_after);

  const { data: templateData, isLoading: isTemplateLoading } =
    useGetTemplateQuery(
      {
        uuid: template,
      },
      { refetchOnMountOrArgChange: true, skip: template === '' },
    );

  const snapshottingText = useMemo(() => {
    switch (true) {
      case isLoading || isTemplateLoading:
        return '';
      case useLatest:
        return 'Use latest';
      case !!snapshotDate:
        return `State as of ${yyyyMMddFormat(new Date(snapshotDate))}`;
      case !!template:
        return `Use a content template: ${templateData?.name}`;
      default:
        return '';
    }
  }, [isLoading, isTemplateLoading, useLatest, snapshotDate, template]);

  return (
    <>
      <Content>
        <Content component={ContentVariants.dl} className='review-step-dl'>
          {!isOnPremise && (
            <>
              <Content
                component={ContentVariants.dt}
                className='pf-v6-u-min-width'
              >
                Repeatable build
              </Content>
              <Content component={ContentVariants.dd}>
                <Popover
                  position='bottom'
                  headerContent={
                    useLatest
                      ? 'Use the latest repository content'
                      : template
                        ? 'Use content from the content template'
                        : `Repositories as of ${yyyyMMddFormat(
                            new Date(snapshotDate),
                          )}`
                  }
                  hasAutoWidth
                  minWidth='60rem'
                  bodyContent={
                    <SnapshotTable snapshotForDate={data?.data || []} />
                  }
                >
                  <Button
                    variant='link'
                    isInline
                    aria-label='Snapshot method'
                    className='popover-button pf-v6-u-p-0'
                    isDisabled={noRepositoriesSelected}
                  >
                    {snapshottingText}
                  </Button>
                </Popover>
                {!useLatest &&
                !isLoading &&
                isSuccess &&
                hasSnapshotDateAfter ? (
                  <Alert
                    variant='warning'
                    isInline
                    isPlain
                    title='A snapshot for this date is not available for some repositories.'
                  />
                ) : (
                  ''
                )}
              </Content>
            </>
          )}
          {!isOnPremise && (
            <>
              <Content
                component={ContentVariants.dt}
                className='pf-v6-u-min-width'
              >
                Repositories
              </Content>
              <Content component={ContentVariants.dd}>
                {customRepositories.length + recommendedRepositories.length >
                0 ? (
                  <Popover
                    position='bottom'
                    headerContent='Repositories'
                    hasAutoWidth
                    minWidth='30rem'
                    bodyContent={<RepositoriesTable />}
                  >
                    <Button
                      variant='link'
                      aria-label='About custom repositories'
                      className='popover-button pf-v6-u-p-0'
                    >
                      {customRepositories.length +
                        recommendedRepositories.length || 0}
                    </Button>
                  </Popover>
                ) : (
                  0
                )}
              </Content>
            </>
          )}
          <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
            Additional packages
          </Content>
          <Content component={ContentVariants.dd}>
            {packages.length > 0 || groups.length > 0 ? (
              <Popover
                position='bottom'
                headerContent='Additional packages'
                hasAutoWidth
                minWidth='60rem'
                bodyContent={<PackagesTable />}
              >
                <Button
                  variant='link'
                  aria-label='About packages'
                  className='popover-button pf-v6-u-p-0'
                >
                  {packages.length + groups.length}
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
          title='Can not guarantee where some selected packages will come from'
          variant='warning'
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
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Registration type
        </Content>
        <Content component={ContentVariants.dd}>
          Register the system later
        </Content>
      </Content>
    </Content>
  );
};

export const RegisterSatelliteList = () => {
  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Register Satellite
        </Content>
        <Content component={ContentVariants.dd}>Enabled</Content>
      </Content>
    </Content>
  );
};

export const RegisterAapList = () => {
  const callbackUrl = useAppSelector(selectAapCallbackUrl);
  const hostConfigKey = useAppSelector(selectAapHostConfigKey);
  const tlsCertificateAuthority = useAppSelector(
    selectAapTlsCertificateAuthority,
  );
  const skipTlsVerification = useAppSelector(selectAapTlsConfirmation);

  const getTlsStatus = () => {
    if (skipTlsVerification) {
      return 'Insecure (TLS verification skipped)';
    }
    return tlsCertificateAuthority ? 'Configured' : 'None';
  };

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Ansible Callback URL
        </Content>
        <Content component={ContentVariants.dd}>
          {callbackUrl || 'None'}
        </Content>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Host Config Key
        </Content>
        <Content component={ContentVariants.dd}>
          {hostConfigKey || 'None'}
        </Content>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          TLS Certificate
        </Content>
        <Content component={ContentVariants.dd}>{getTlsStatus()}</Content>
      </Content>
    </Content>
  );
};

export const RegisterNowList = () => {
  const isOnPremise = useAppSelector(selectIsOnPremise);

  const orgId = useAppSelector(selectOrgId);
  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);

  const { isError } = useShowActivationKeyQuery(
    // @ts-ignore type of 'activationKey' might not be strictly compatible with the expected type for 'name'.
    { name: activationKey },
    {
      skip: !activationKey || isOnPremise,
    },
  );

  return (
    <>
      <Content className='pf-v6-u-pb-sm'>
        <Content component={ContentVariants.dl} className='review-step-dl'>
          <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
            Registration method
          </Content>
          <Content
            component={ContentVariants.dd}
            data-testid='review-registration'
          >
            <Content component='ul' isPlainList>
              {registrationType.startsWith('register-now') && (
                <Content component='li'>
                  <Icon status='success'>
                    <CheckCircleIcon />
                  </Icon>{' '}
                  Register with Red Hat Subscription Manager (RHSM)
                  <br />
                </Content>
              )}
              {(registrationType === 'register-now-insights' ||
                registrationType === 'register-now-rhc') && (
                <Content component='li'>
                  <Icon status='success'>
                    <CheckCircleIcon />
                  </Icon>{' '}
                  Connect to Red Hat Lightspeed
                  <br />
                </Content>
              )}
              {registrationType === 'register-now-rhc' && (
                <Content component='li'>
                  <Icon status='success'>
                    <CheckCircleIcon />
                  </Icon>{' '}
                  Use remote host configuration (rhc) utility
                  <br />
                </Content>
              )}
            </Content>
          </Content>
          <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
            Organization ID
          </Content>
          <Content component={ContentVariants.dd}>{orgId}</Content>
          <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
            Activation key
          </Content>
          <Content component={ContentVariants.dd}>{activationKey}</Content>
        </Content>
      </Content>
      {isError && (
        <Alert
          title='Information about the activation key unavailable'
          variant='danger'
          isInline
        >
          Information about the activation key cannot be loaded. Please check
          the key was not removed and try again later.
        </Alert>
      )}
    </>
  );
};

export const TimezoneList = () => {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);

  return (
    <>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Timezone
        </Content>
        <Content component={ContentVariants.dd}>
          {timezone ? timezone : 'None'}
        </Content>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          NTP servers
        </Content>
        <Content component={ContentVariants.dd}>
          {ntpServers && ntpServers.length > 0 ? ntpServers.join(', ') : 'None'}
        </Content>
      </Content>
    </>
  );
};

export const UsersList = () => {
  const users = useAppSelector(selectUsers);

  return (
    <Table variant='compact' borders={false}>
      <Thead>
        <Tr>
          <Th>Username</Th>
          <Th>Password</Th>
          <Th>SSH key</Th>
          <Th>Groups</Th>
          <Th>Administrator</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((user) => (
          <Tr key={user.name}>
            <Td width={25}>{user.name ? user.name : 'None'}</Td>
            <Td>
              {user.password || user.hasPassword ? '●'.repeat(8) : 'None'}
            </Td>
            <Td>{user.ssh_key ? user.ssh_key : 'None'}</Td>
            <Td>
              {user.groups.length > 0 ? (
                <Popover
                  position='bottom'
                  hasAutoWidth
                  minWidth='30rem'
                  bodyContent={<UserGroupsTable groups={user.groups} />}
                >
                  <Button variant='link' isInline aria-label='View user groups'>
                    {user.groups.length}
                  </Button>
                </Popover>
              ) : (
                'None'
              )}
            </Td>
            <Td>
              {user.isAdministrator ? (
                <>
                  <Icon status='success'>
                    <CheckCircleIcon />
                  </Icon>{' '}
                  Enabled
                </>
              ) : (
                <>
                  <Icon status='danger'>
                    <TimesCircleIcon />
                  </Icon>{' '}
                  Disabled
                </>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export const GroupsList = ({ groups }: { groups: UserGroup[] }) => {
  return (
    <Table variant='compact' borders={false} className='pf-v6-u-w-50'>
      <Thead>
        <Tr>
          <Th>Group name</Th>
          <Th>GID</Th>
        </Tr>
      </Thead>
      <Tbody>
        {groups.map((group) => (
          <Tr key={group.name}>
            <Td width={50}>{group.name}</Td>
            <Td>{group.gid !== undefined ? group.gid : 'None'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export const LocaleList = () => {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Languages
        </Content>
        <Content component={ContentVariants.dd}>
          {languages && languages.length > 0 ? languages.join(', ') : 'None'}
        </Content>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Name
        </Content>
        <Content component={ContentVariants.dd}>
          {kernel.name ? kernel.name : 'None'}
        </Content>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          Arguments
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
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
      </Content>
    </Content>
  );
};

export const ServicesList = () => {
  const services = useAppSelector(selectServices);

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
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
      </Content>
    </Content>
  );
};

export const FirstBootList = () => {
  const isFirstbootEnabled = !!useAppSelector(selectFirstBootScript);

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          First boot script
        </Content>
        <Content component={ContentVariants.dd}>
          {isFirstbootEnabled ? 'Enabled' : 'Disabled'}
        </Content>
      </Content>
    </Content>
  );
};
