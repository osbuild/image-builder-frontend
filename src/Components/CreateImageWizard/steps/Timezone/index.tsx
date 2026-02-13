import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import NtpServersInput from './components/NtpServersInput';
import TimezoneDropDown from './components/TimezoneDropDown';

import { DEFAULT_TIMEZONE } from '../../../../constants';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const TimezoneStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='timezone' />
      <Title headingLevel='h1' size='xl'>
        Timezone
      </Title>
      <Content>
        Select a timezone for your image. The default timezone is &apos;
        {DEFAULT_TIMEZONE}&apos;. You can also configure NTP servers - multiple
        servers can be added.
      </Content>
      <TimezoneDropDown />
      <NtpServersInput />
    </Form>
  );
};

export default TimezoneStep;
