import React from 'react';

import { Form } from '@patternfly/react-core';

import AzureAuthButton from './components/AzureAuthButton';
import AzureHyperVSelect from './components/AzureHyperVSelect';
import ResourceGroupInput from './components/ResourceGroupInput';
import SubscriptionIdInput from './components/SubscriptionIdInput';
import TenantIdInput from './components/TenantIdInput';

const Azure = () => {
  return (
    <Form className='pf-v6-u-pb-md'>
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
