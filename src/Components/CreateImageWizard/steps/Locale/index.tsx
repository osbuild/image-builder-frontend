import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import KeyboardDropDown from './components/KeyboardDropDown';
import LanguagesDropDown from './components/LanguagesDropDown';

const LocaleStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Locale
      </Title>
      <Content>Select the locale for your image.</Content>
      <LanguagesDropDown />
      <KeyboardDropDown />
    </Form>
  );
};

export default LocaleStep;
