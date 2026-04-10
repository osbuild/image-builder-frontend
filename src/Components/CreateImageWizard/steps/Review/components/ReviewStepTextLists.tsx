import React from 'react';

import {
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
  selectFilesystemPartitions,
  selectFirewall,
  selectFirstBootScript,
  selectFscMode,
  selectHostname,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectNtpServers,
  selectServices,
  selectTimezone,
  selectUsers,
  UserGroup,
} from '@/store/slices/wizard';

import {
  DiskReviewTable,
  FSReviewTable,
  UserGroupsTable,
} from './ReviewStepTables';

import { useAppSelector } from '../../../../../store/hooks';
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
