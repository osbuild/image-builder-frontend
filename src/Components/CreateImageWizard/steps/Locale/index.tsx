import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import KeyboardInput from './components/KeyboardInput';
import LanguagesDropDown from './components/LanguagesDropDown';

const LocaleStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Locale
      </Title>
      <Text>Select locale for your image.</Text>
      <LanguagesDropDown />
      <KeyboardInput />
    </Form>
  );
};

export default LocaleStep;
