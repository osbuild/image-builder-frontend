import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import ValidatedListInput from '@/Components/CreateImageWizard/ValidatedListInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addNtpServer,
  removeNtpServer,
  selectNtpServers,
  validateNtpServers,
} from '@/store/slices/wizard';

const NtpServersInput = () => {
  const dispatch = useAppDispatch();
  const ntpServers = useAppSelector(selectNtpServers);

  return (
    <FormGroup isRequired={false} label='NTP servers'>
      <ValidatedListInput
        ariaLabel='Add NTP server'
        placeholder='Add NTP servers'
        validator={validateNtpServers}
        items={(ntpServers ?? []).map((server) => ({
          value: server,
          required: false,
        }))}
        onAdd={(value) => dispatch(addNtpServer(value))}
        onRemove={(value) => dispatch(removeNtpServer(value))}
        helperText='Specify NTP servers by hostname or IP address. Examples: server.example.com, 172.16.254.1.'
      />
    </FormGroup>
  );
};

export default NtpServersInput;
