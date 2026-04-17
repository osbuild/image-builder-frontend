import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import NtpServersInput from './components/NtpServersInput';
import TimezoneDropDown from './components/TimezoneDropDown';

const TimezoneStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='timezone' />
      <Title headingLevel='h1' size='xl'>
        Timezone
      </Title>
      <Content>
        Select a timezone and define NTP servers to ensure your image maintains
        accurate system time upon deployment.
      </Content>
      <TimezoneDropDown />
      <NtpServersInput />
    </Form>
  );
};

export default TimezoneStep;
