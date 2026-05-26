import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import NtpServersInput from './components/NtpServersInput';
import TimezoneDropDown from './components/TimezoneDropDown';

const TimezoneStep = () => {
  return (
    <>
      <CustomizationLabels customization='timezone' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Time
        </Title>
        <Content component='small'>
          Select a timezone and define NTP servers to ensure your image
          maintains accurate system time upon deployment.
        </Content>
      </Content>
      <TimezoneDropDown />
      <NtpServersInput />
    </>
  );
};

export default TimezoneStep;
