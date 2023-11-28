import React, { useContext } from 'react';

import {
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import { ImageWizardContext } from '../../ImageWizardContext';
import { gcpAccountToString } from '../TargetEnvironment/GCP/GCPTarget';

const ExpirationWarning = () => {
  return (
    <div className="pf-u-mr-sm pf-u-font-size-sm pf-u-warning-color-100">
      <ExclamationTriangleIcon /> Expires 14 days after creation
    </div>
  );
};

export const TargetEnvAWSList = () => {
  const { isAwsManualState, associatedAwsAccountIdState, awsSourceState } =
    useContext(ImageWizardContext);
  const [accountId] = associatedAwsAccountIdState;
  const [source] = awsSourceState;
  const [isManual] = isAwsManualState;
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
          {accountId}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          {!isManual ? 'Source' : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {!isManual && source[1]}
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
  const { gcpAccountTypeState, gcpAccountEmailState, gcpDomainState } =
    useContext(ImageWizardContext);
  const [accountType] = gcpAccountTypeState;
  const [accountEmail] = gcpAccountEmailState;
  const [domain] = gcpDomainState;
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
        {(accountEmail || domain) && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Shared with
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              A Google account
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              Account type
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {gcpAccountToString(accountType)}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dt}>
              {accountType === 'domain' ? 'Domain' : 'Principal'}
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {accountEmail || domain}
            </TextListItem>
          </>
        )}
        {!(accountEmail || domain) && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Shared with
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              Red Hat Insights only
            </TextListItem>
          </>
        )}
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvAzureList = () => {
  const {
    azureTenantIdState,
    azureSourceState,
    azureSubscriptionIdState,
    azureResourceGroupState,
    isAzureManualState,
  } = useContext(ImageWizardContext);
  const [tenantId] = azureTenantIdState;
  const [subscriptionId] = azureSubscriptionIdState;
  const [source] = azureSourceState;
  const [resourceGroup] = azureResourceGroupState;
  const [manual] = isAzureManualState;
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
        {!manual && source[1] && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Azure Source
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {source[1]}
            </TextListItem>
          </>
        )}
        {manual && (
          <>
            <TextListItem component={TextListItemVariants.dt}>
              Azure Tenant GUID
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
          {resourceGroup}
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
