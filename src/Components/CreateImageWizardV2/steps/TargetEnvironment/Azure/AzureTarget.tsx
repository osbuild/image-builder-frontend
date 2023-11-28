import React, { useContext } from 'react';

import {
  Alert,
  Button,
  Form,
  FormGroup,
  Gallery,
  GalleryItem,
  Radio,
  Text,
  TextContent,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useGetSourceListQuery } from '../../../../../store/provisioningApi';
import TypeAheadSelect from '../../../common/TypeAheadSelect';
import ValidatedTextField from '../../../common/ValidatedTextField';
import { ImageWizardContext } from '../../../ImageWizardContext';
import { SourcesSelect, useGetAccountData } from '../SourcesSelect';

type AzureAuthButtonPropTypes = {
  tenantId: string;
};

const AzureAuthButton = ({ tenantId }: AzureAuthButtonPropTypes) => {
  return (
    <FormGroup>
      <Button
        component="a"
        target="_blank"
        variant="secondary"
        isDisabled={!validateAzureId(tenantId)}
        href={
          'https://login.microsoftonline.com/' +
          tenantId +
          '/oauth2/v2.0/authorize?client_id=b94bb246-b02c-4985-9c22-d44e66f657f4&scope=openid&' +
          'response_type=code&response_mode=query&redirect_uri=https://portal.azure.com'
        }
      >
        Authorize Image Builder
      </Button>
    </FormGroup>
  );
};

const SourcesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={'settings/sources'}
    >
      Create and manage sources here
    </Button>
  );
};

export const ValidateAzureStep = () => {
  const {
    azureTenantIdState,
    azureSubscriptionIdState,
    azureResourceGroupState,
  } = useContext(ImageWizardContext);
  const [tenantId] = azureTenantIdState;
  const [subId] = azureSubscriptionIdState;
  const [resourceGroup] = azureResourceGroupState;
  return validateAzureId(tenantId) && validateAzureId(subId) && resourceGroup;
};

const validateAzureId = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

const validateResourceGroup = (value: string) => {
  return /^[-\w._()]+[-\w_()]$/.test(value);
};

const AzureTarget = () => {
  const {
    azureSourceState,
    azureTenantIdState,
    azureResourceGroupState,
    azureSubscriptionIdState,
    isAzureManualState,
  } = useContext(ImageWizardContext);
  const [source, setSource] = azureSourceState;
  const [tenantId, setTenantId] = azureTenantIdState;
  const [resourceGroup, setResourceGroup] = azureResourceGroupState;
  const [subscriptionId, setSubscriptionId] = azureSubscriptionIdState;
  const [isManual, setIsManual] = isAzureManualState;
  const { isError: isErrorFetchingDetails, resourceGroups } = useGetAccountData(
    source[0],
    'azure'
  );
  const { isError: isErrorFetchingSources } = useGetSourceListQuery({
    provider: 'azure',
  });
  const clearState = () => {
    // when the user switches from manual to automatic, reset everything
    setSource([0, '']);
    setTenantId('');
    setResourceGroup('');
    setSubscriptionId('');
  };

  return (
    <>
      <Form>
        <Title headingLevel="h2">Target environment - Microsoft Azure</Title>
        <TextContent>
          <Text>
            Upon build, Image Builder sends the image to the selected authorized
            Azure account. The image will be uploaded to the resource group in
            the subscription you specify.
          </Text>
          <Text>
            To authorize Image Builder to push images to Microsoft Azure, the
            account owner must configure Image Builder as an authorized
            application for a specific tenant GUID and give it the role of
            &quot;Contributor&quot; for the resource group you want to upload
            to. This applies even when defining target by Source selection.
            <br />
            <Button
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isInline
              href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow"
            >
              Learn more about OAuth 2.0
            </Button>
          </Text>
        </TextContent>
        <FormGroup label="Share method:">
          <Radio
            name="azure-share-source"
            id="azure-share-source"
            label="Use an account configured from Sources."
            description={
              'Use a configured source to launch environments directly from the console.'
            }
            checked={!isManual}
            isChecked={!isManual}
            onClick={() => {
              setIsManual(false);
              clearState();
            }}
          />
          <Radio
            name="azure-share-manual"
            id="azure-share-manual"
            label="Manually enter the account information."
            checked={isManual}
            isChecked={isManual}
            onClick={() => {
              setIsManual(true);
              clearState();
            }}
          />
        </FormGroup>
        {!isManual && (
          <>
            <SourcesSelect
              provider="azure"
              selectedSource={source}
              setSelectedSource={setSource}
            />
            <>
              {isErrorFetchingSources && (
                <Alert
                  variant={'danger'}
                  isPlain={true}
                  isInline={true}
                  title={'Sources unavailable'}
                >
                  Sources cannot be reached, try again later or enter an account
                  info for upload manually.
                </Alert>
              )}
              {isErrorFetchingDetails && (
                <Alert
                  variant={'danger'}
                  isPlain
                  isInline
                  title={'Azure details unavailable'}
                >
                  Could not fetch Tenant GUID and Subscription ID from Azure for
                  given Source. Check Sources page for the source availability
                  or select a different Source.
                </Alert>
              )}
            </>
            <SourcesButton />
          </>
        )}
        {!isManual && (
          <>
            <Gallery hasGutter>
              <GalleryItem>
                <FormGroup label="Azure Tenant GUID" isRequired>
                  <TextInput
                    value={tenantId}
                    type="text"
                    readOnlyVariant="default"
                    aria-label="Azure Tenant GUID"
                    isRequired
                  />
                </FormGroup>
              </GalleryItem>
              <GalleryItem>
                <FormGroup label="Subscription ID" isRequired>
                  <TextInput
                    value={subscriptionId}
                    type="text"
                    readOnlyVariant="default"
                    aria-label="Subscription ID"
                    isRequired
                  />
                </FormGroup>
              </GalleryItem>
            </Gallery>
            <AzureAuthButton tenantId={tenantId} />
            <FormGroup label="Resource group" isRequired>
              <TypeAheadSelect
                inputOptions={resourceGroups}
                fieldID="resource-group-select"
                selected={resourceGroup}
                setSelected={setResourceGroup}
                placeholderText="Select a resource group"
              />
            </FormGroup>
          </>
        )}
        {isManual && (
          <>
            <ValidatedTextField
              aria="Azure tenant id"
              label="Azure Tenant GUID"
              fieldId="azure-tenant-id"
              value={tenantId}
              setValue={setTenantId}
              validateFunction={validateAzureId}
              helperText="Please enter a valid tenant GUID"
            />
            <AzureAuthButton tenantId={tenantId} />
            <ValidatedTextField
              aria="Azure subscription id"
              label="Subscription ID"
              fieldId="azure-subscription-id"
              value={subscriptionId}
              setValue={setSubscriptionId}
              validateFunction={validateAzureId}
              helperText="Please enter a valid subscription ID"
            />
            <ValidatedTextField
              aria="Azure resource group"
              label="Resource group"
              fieldId="azure-resource-group"
              value={resourceGroup}
              setValue={setResourceGroup}
              validateFunction={validateResourceGroup}
              helperText="Resource group names only allow alphanumeric characters,
            periods, underscores, hyphens, and parenthesis and cannot end in a period"
            />
          </>
        )}
      </Form>
    </>
  );
};
export default AzureTarget;
