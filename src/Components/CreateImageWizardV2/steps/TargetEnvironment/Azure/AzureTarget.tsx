import React, { Dispatch, SetStateAction, useState } from 'react';

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

import TypeAheadSelect from '../../../common/TypeAheadSelect';
import ValidatedTextField from '../../../common/ValidatedTextField';
import { SourcesSelect } from '../SourcesSelect';

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

export const validateAzureId = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

export const validateResourceGroup = (value: string) => {
  return /^[-\w._()]+[-\w_()]$/.test(value);
};

type AzureTargetPropTypes = {
  manual: boolean;
  setManual: Dispatch<SetStateAction<boolean>>;
  isErrorFetchingDetails: boolean;
  source: [number, string];
  setSource: Dispatch<SetStateAction<[number, string]>>;
  subscriptionId: string;
  setSubscriptionId: Dispatch<SetStateAction<string>>;
  tenantId: string;
  setTenantId: Dispatch<SetStateAction<string>>;
  resourceGroup: string;
  setResourceGroup: Dispatch<SetStateAction<string>>;
  resourceGroups: string[];
};

/**
 * Component that enables the user to enter the necessary information to upload
 * to azure.
 * @param manual set to true if the user will enter the information manually, set to
 * false if they are fetched from the sources
 * @param setManual a function to update the `manual` value
 * @param source if not in manual mode holds the selected source by
 * the user.
 * @param setsource a function to update the sourceId
 * @param tenantId a value either computed via the sources if a sourceId
 * was selected or manually entered by the user
 * @param setTenantId a function to update the tenantId
 * @param subscriptionId a value either computed via the sources if a sourceId
 * was selected or manually entered by the user
 * @param setSubscriptionId a function to update the subscriptionId
 * @param resourceGroup holds a resource group the user either selected
 * in a set of possibilities or entered manually
 * @param setResourceGroup a function to update the
 * ResourceGroup
 * @param resourceGroups a list of resource groups computed via the sources if a
 * sourceId was selected that contains choices for the user to select
 * the resourceGroup.
 */
const AzureTarget = ({
  manual,
  setManual,
  isErrorFetchingDetails,
  source,
  setSource,
  tenantId,
  setTenantId,
  subscriptionId,
  setSubscriptionId,
  resourceGroup,
  setResourceGroup,
  resourceGroups,
}: AzureTargetPropTypes) => {
  const [isErrorFetchingSources, setIsErrorFetchingSources] = useState(false);
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
            checked={!manual}
            isChecked={!manual}
            onClick={() => {
              setManual(false);
              clearState();
            }}
          />
          <Radio
            name="azure-share-manual"
            id="azure-share-manual"
            label="Manually enter the account information."
            checked={manual}
            isChecked={manual}
            onClick={() => {
              setManual(true);
              clearState();
            }}
          />
        </FormGroup>
        {!manual && (
          <>
            <SourcesSelect
              provider="azure"
              selectedSource={source}
              setSelectedSource={setSource}
              setFetchingError={setIsErrorFetchingSources}
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
        {!manual && (
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
        {manual && (
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
