import React from 'react';

import {
  Button,
  Content,
  Form,
  FormGroup,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { AzureAuthButton } from './AzureAuthButton';
import { AzureHyperVSelect } from './AzureHyperVSelect';

import { AZURE_AUTH_URL } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAzureResourceGroup,
  changeAzureSubscriptionId,
  changeAzureTenantId,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
} from '../../../../../store/wizardSlice';
import { ValidatedInput } from '../../../ValidatedInput';
import {
  isAzureResourceGroupValid,
  isAzureSubscriptionIdValid,
  isAzureTenantGUIDValid,
} from '../../../validators';

export const AzureConfig = () => {
  const dispatch = useAppDispatch();
  const tenantId = useAppSelector(selectAzureTenantId);
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);
  const resourceGroup = useAppSelector(selectAzureResourceGroup);

  return (
    <>
      <AzureHyperVSelect />
      <FormGroup label='Azure tenant GUID' isRequired>
        <ValidatedInput
          ariaLabel='Azure tenant GUID'
          value={tenantId || ''}
          validator={isAzureTenantGUIDValid}
          onChange={(_event, value) => dispatch(changeAzureTenantId(value))}
          helperText={
            !tenantId
              ? 'Tenant ID is required'
              : 'Please enter a valid tenant ID'
          }
        />
      </FormGroup>
      <AzureAuthButton />
      <FormGroup label='Subscription ID' isRequired>
        <ValidatedInput
          ariaLabel='subscription id'
          value={subscriptionId || ''}
          validator={isAzureSubscriptionIdValid}
          onChange={(_event, value) =>
            dispatch(changeAzureSubscriptionId(value))
          }
          helperText={
            !subscriptionId
              ? 'Subscription ID is required'
              : 'Please enter a valid subscription ID'
          }
        />
      </FormGroup>
      <FormGroup label='Resource group' isRequired>
        <ValidatedInput
          ariaLabel='resource group'
          value={resourceGroup || ''}
          validator={isAzureResourceGroupValid}
          onChange={(_event, value) =>
            dispatch(changeAzureResourceGroup(value))
          }
          helperText={
            !resourceGroup
              ? 'Resource group is required'
              : 'Resource group names only allow alphanumeric characters, periods, underscores, hyphens, and parenthesis and cannot end in a period'
          }
        />
      </FormGroup>
    </>
  );
};

const Azure = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Target environment - Microsoft Azure
      </Title>
      <Content>
        Upon build, Image Builder sends the image to the selected authorized
        Azure account. The image will be uploaded to the resource group in the
        subscription you specify.
      </Content>
      <Content>
        To authorize Image Builder to push images to Microsoft Azure, the
        account owner must configure Image Builder as an authorized application
        for a specific tenant ID and give it the role of &quot;Contributor&quot;
        for the resource group you want to upload to.
        <br />
        <Button
          component='a'
          target='_blank'
          variant='link'
          icon={<ExternalLinkAltIcon />}
          iconPosition='right'
          isInline
          href={AZURE_AUTH_URL}
        >
          Learn more about OAuth 2.0
        </Button>
      </Content>
      <AzureConfig />
    </Form>
  );
};

export default Azure;
