import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import KeyboardDropDown from './components/KeyboardDropDown';
import LanguagesDropDown from './components/LanguagesDropDown';

const LocaleStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Locale
      </Title>
      <Text>Select the locale for your image.</Text>
      <LanguagesDropDown />
      <KeyboardDropDown />
    </Form>
  );
};

export default LocaleStep;
