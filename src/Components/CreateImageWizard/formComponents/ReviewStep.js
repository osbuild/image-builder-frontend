import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  List,
  ListItem,
  Popover,
  Spinner,
  Tabs,
  Tab,
  TabTitleText,
  Text,
  TextContent,
  TextVariants,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
} from '@patternfly/react-core';
import {
  TableComposable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import { HelpIcon } from '@patternfly/react-icons';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { googleAccType } from '../steps/googleCloud';
import { RELEASES, UNIT_GIB, UNIT_MIB } from '../../../constants';
import isRhel from '../../../Utilities/isRhel';

const FSReviewTable = ({ ...props }) => {
  return (
    <TableComposable
      aria-label="File system configuration table"
      variant="compact"
    >
      <Thead>
        <Tr>
          <Th>Mount point</Th>
          <Th>Type</Th>
          <Th>Minimum size</Th>
        </Tr>
      </Thead>
      <Tbody data-testid="file-system-configuration-tbody-review">
        {props.fsc.map((r, ri) => (
          <Tr key={ri}>
            <Td className="pf-m-width-60">{r.mountpoint}</Td>
            <Td className="pf-m-width-10">xfs</Td>
            <Td className="pf-m-width-30">
              {r.size}{' '}
              {r.unit === UNIT_GIB
                ? 'GiB'
                : r.unit === UNIT_MIB
                ? 'MiB'
                : 'KiB'}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

FSReviewTable.propTypes = {
  fsc: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const ReviewStep = () => {
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [orgId, setOrgId] = useState();
  const [minSize, setMinSize] = useState();
  const { change, getState } = useFormApi();

  useEffect(() => {
    const registerSystem = getState()?.values?.['register-system'];
    if (
      registerSystem === 'register-now' ||
      registerSystem === 'register-now-insights'
    ) {
      (async () => {
        const userData = await insights?.chrome?.auth?.getUser();
        const id = userData?.identity?.internal?.org_id;
        setOrgId(id);
        change('subscription-organization-id', id);
      })();
    }

    if (
      getState()?.values?.['file-system-config-toggle'] === 'manual' &&
      getState()?.values?.['file-system-configuration']
    ) {
      let size = 0;
      for (const fsc of getState().values['file-system-configuration']) {
        size += fsc.size * fsc.unit;
      }

      size = (size / UNIT_GIB).toFixed(1);
      if (size < 1) {
        setMinSize(`Less than 1 GiB`);
      } else {
        setMinSize(`${size} GiB`);
      }
    }
  });

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <>
      <Text>
        Review the information and click &quot;Create image&quot; to create the
        image using the following criteria.
      </Text>
      <DescriptionList isCompact isHorizontal>
        <DescriptionListGroup>
          {getState()?.values?.['image-name'] && (
            <>
              <DescriptionListTerm>Image name</DescriptionListTerm>
              <DescriptionListDescription>
                {getState()?.values?.['image-name']}
              </DescriptionListDescription>
            </>
          )}
          <DescriptionListTerm>Release</DescriptionListTerm>
          <DescriptionListDescription>
            {RELEASES[getState()?.values?.release]}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      <Tabs
        isFilled
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        className="pf-u-w-75"
      >
        <Tab
          eventKey={0}
          title={<TabTitleText>Target environment</TabTitleText>}
          data-testid="tab-target"
          autoFocus
        >
          <List isPlain iconSize="large">
            {getState()?.values?.['target-environment']?.aws && (
              <ListItem
                icon={
                  <img
                    className="provider-icon"
                    src="/apps/frontend-assets/partners-icons/aws.svg"
                  />
                }
              >
                <TextContent>
                  <Text component={TextVariants.h3}>Amazon Web Services</Text>
                  <TextList component={TextListVariants.dl}>
                    <TextListItem component={TextListItemVariants.dt}>
                      Account ID
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dd}>
                      {getState()?.values?.['aws-account-id']}
                    </TextListItem>
                  </TextList>
                </TextContent>
              </ListItem>
            )}
            {getState()?.values?.['target-environment']?.gcp && (
              <ListItem
                className="pf-c-list__item pf-u-mt-md"
                icon={
                  <img
                    className="provider-icon"
                    src="/apps/frontend-assets/partners-icons/google-cloud-short.svg"
                  />
                }
              >
                <TextContent>
                  <Text component={TextVariants.h3}>Google Cloud Platform</Text>
                  <TextList component={TextListVariants.dl}>
                    <TextListItem component={TextListItemVariants.dt}>
                      {
                        googleAccType?.[
                          getState()?.values?.['google-account-type']
                        ]
                      }
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dd}>
                      {getState()?.values?.['google-email'] ||
                        getState()?.values?.['google-domain']}
                    </TextListItem>
                  </TextList>
                </TextContent>
              </ListItem>
            )}
            {getState()?.values?.['target-environment']?.azure && (
              <ListItem
                className="pf-c-list__item pf-u-mt-md"
                icon={
                  <img
                    className="provider-icon"
                    src="/apps/frontend-assets/partners-icons/microsoft-azure-short.svg"
                  />
                }
              >
                <TextContent>
                  <Text component={TextVariants.h3}>Microsoft Azure</Text>
                  <TextList component={TextListVariants.dl}>
                    <TextListItem component={TextListItemVariants.dt}>
                      Subscription ID
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dd}>
                      {getState()?.values?.['azure-subscription-id']}
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dt}>
                      Tenant ID
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dd}>
                      {getState()?.values?.['azure-tenant-id']}
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dt}>
                      Resource group
                    </TextListItem>
                    <TextListItem component={TextListItemVariants.dd}>
                      {getState()?.values?.['azure-resource-group']}
                    </TextListItem>
                  </TextList>
                </TextContent>
              </ListItem>
            )}
            {getState()?.values?.['target-environment']?.vsphere && (
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.h3}>VMWare</Text>
                </TextContent>
              </ListItem>
            )}
            {getState()?.values?.['target-environment']?.['guest-image'] && (
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.h3}>
                    Virtualization - Guest image
                  </Text>
                </TextContent>
              </ListItem>
            )}
            {getState()?.values?.['target-environment']?.[
              'image-installer'
            ] && (
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.h3}>
                    Bare metal - Installer
                  </Text>
                </TextContent>
              </ListItem>
            )}
          </List>
        </Tab>
        {isRhel(getState()?.values?.release) && (
          <Tab
            eventKey={1}
            title={<TabTitleText>Registration</TabTitleText>}
            data-testid="tab-registration"
          >
            {getState()?.values?.['register-system'] === 'register-later' && (
              <TextContent>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    Subscription
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    Register the system later
                  </TextListItem>
                </TextList>
              </TextContent>
            )}
            {(getState()?.values?.['register-system'] === 'register-now' ||
              getState()?.values?.['register-system'] ===
                'register-now-insights') && (
              <TextContent>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>
                    Subscription
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    {getState()?.values?.['register-system'] ===
                      'register-now-insights' &&
                      'Register with Subscriptions and Red Hat Insights'}
                    {getState()?.values?.['register-system'] ===
                      'register-now' && 'Register with Subscriptions'}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    Activation key
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    {getState()?.values?.['subscription-activation-key']}
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>
                    Organization ID
                  </TextListItem>
                  {orgId !== undefined ? (
                    <TextListItem
                      component={TextListItemVariants.dd}
                      data-testid="organization-id"
                    >
                      {orgId}
                    </TextListItem>
                  ) : (
                    <TextListItem component={TextListItemVariants.dd}>
                      <Spinner />
                    </TextListItem>
                  )}
                </TextList>
              </TextContent>
            )}
          </Tab>
        )}
        <Tab
          eventKey={2}
          title={<TabTitleText>System configuration</TabTitleText>}
          data-testid="tab-system"
        >
          <TextContent>
            <Text component={TextVariants.h3}>File system configuration</Text>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                Partitioning
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dd}
                data-testid="partitioning-auto-manual"
              >
                {getState()?.values?.['file-system-config-toggle'] === 'manual'
                  ? 'Manual'
                  : 'Automatic'}
                {getState()?.values?.['file-system-config-toggle'] ===
                  'manual' && (
                  <>
                    {' '}
                    <Popover
                      position="bottom"
                      headerContent="Partitions"
                      hasAutoWidth
                      minWidth="30rem"
                      bodyContent={
                        <FSReviewTable
                          fsc={getState().values['file-system-configuration']}
                        />
                      }
                    >
                      <Button
                        data-testid="file-system-configuration-popover"
                        variant="link"
                        aria-label="File system configuration info"
                        aria-describedby="file-system-configuration-info"
                      >
                        View partitions
                      </Button>
                    </Popover>
                  </>
                )}
              </TextListItem>
              {getState()?.values?.['file-system-config-toggle'] ===
                'manual' && (
                <>
                  <TextListItem component={TextListItemVariants.dt}>
                    Image size (minimum)
                    <Popover
                      hasAutoWidth
                      bodyContent={
                        <TextContent>
                          <Text>
                            Image Builder may extend this size based on
                            requirements, selected packages, and configurations.
                          </Text>
                        </TextContent>
                      }
                    >
                      <Button
                        variant="plain"
                        aria-label="File system configuration info"
                        aria-describedby="file-system-configuration-info"
                        className="pf-c-form__group-label-help"
                      >
                        <HelpIcon />
                      </Button>
                    </Popover>
                  </TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>
                    {minSize}
                  </TextListItem>
                </>
              )}
            </TextList>
            <Text component={TextVariants.h3}>Packages</Text>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                Chosen
              </TextListItem>
              <TextListItem
                component={TextListItemVariants.dd}
                data-testid="chosen-packages-count"
              >
                {getState()?.values?.['selected-packages']?.length || 0}
              </TextListItem>
            </TextList>
          </TextContent>
        </Tab>
      </Tabs>
    </>
  );
};

export default ReviewStep;
