import React from 'react';

import { Button, Content, Form, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import AzureAuthButton from './components/AzureAuthButton';
import AzureHyperVSelect from './components/AzureHyperVSelect';
import ResourceGroupInput from './components/ResourceGroupInput';
import SubscriptionIdInput from './components/SubscriptionIdInput';
import TenantIdInput from './components/TenantIdInput';
import { AZURE_AUTH_URL } from './constants';

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
      <AzureHyperVSelect />
      <>
        <TenantIdInput />
        <AzureAuthButton />
        <SubscriptionIdInput />
        <ResourceGroupInput />
      </>
    </Form>
  );
};

export default Azure;
