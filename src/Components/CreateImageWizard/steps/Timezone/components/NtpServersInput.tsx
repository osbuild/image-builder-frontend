import React from 'react';

import { FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { useTimezoneValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isNtpServerValid } from '@/Components/CreateImageWizard/validators';
import { useAppSelector } from '@/store/hooks';
import {
  addNtpServer,
  removeNtpServer,
  selectNtpServers,
} from '@/store/slices/wizard';

const NtpServersInput = () => {
  const ntpServers = useAppSelector(selectNtpServers);

  const stepValidation = useTimezoneValidation();

  return (
    <FormGroup isRequired={false} label='NTP servers'>
      <LabelInput
        ariaLabel='Add NTP server'
        placeholder='Add NTP servers'
        validator={isNtpServerValid}
        list={ntpServers}
        item='NTP server'
        addAction={addNtpServer}
        removeAction={removeNtpServer}
        stepValidation={stepValidation}
        fieldName='ntpServers'
      />
      <HelperText className='pf-v6-u-pt-sm'>
        <HelperTextItem>
          Specify NTP servers by hostname or IP address. Examples:
          server.example.com, 172.16.254.1
        </HelperTextItem>
      </HelperText>
    </FormGroup>
  );
};

export default NtpServersInput;
