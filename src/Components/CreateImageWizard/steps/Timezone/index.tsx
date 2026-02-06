import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import NtpServersInput from './components/NtpServersInput';
import TimezoneDropDown from './components/TimezoneDropDown';

import { NetworkInstallerAlert } from '../../../sharedComponents/NetworkInstallerAlert';

const TimezoneStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Timezone
      </Title>
      <Content>Select a timezone for your image.</Content>
      <NetworkInstallerAlert />
      <TimezoneDropDown />
      <NtpServersInput />
    </Form>
  );
};

export default TimezoneStep;
