import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useFlag } from '@/Utilities/useGetEnvironment';

import HostnameInput from './components/HostnameInput';

const HostnameStep = () => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper
      {
        // the old wizard is still using a form, so we need
        // to do this to prevent the page from reloading. For
        // the new wizard, this is done in the parent form instead
        ...(!isWizardRevampEnabled && {
          onSubmit: (event: React.FormEvent) => {
            event.preventDefault();
          },
        })
      }
    >
      <CustomizationLabels customization='hostname' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
        >
          Hostname
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Define the hostname to uniquely identify this system within your
          network environment.
        </Content>
      </Content>
      <HostnameInput />
    </Wrapper>
  );
};

export default HostnameStep;
