import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import KeyboardDropDown from './components/KeyboardDropDown';
import LanguagesDropDown from './components/LanguagesDropDown';

import { NetworkInstallerAlert } from '../../../sharedComponents/NetworkInstallerAlert';

const LocaleStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Locale
      </Title>
      <Content>Select the locale for your image.</Content>
      <NetworkInstallerAlert />
      <LanguagesDropDown />
      <KeyboardDropDown />
    </Form>
  );
};

export default LocaleStep;
