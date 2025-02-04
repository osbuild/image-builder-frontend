import React from 'react';

import { FormGroup } from '@patternfly/react-core';

import { useAppSelector } from '../../../../../store/hooks';
import {
  addNtpServer,
  removeNtpServer,
  selectNtpServers,
} from '../../../../../store/wizardSlice';
import ChippingInput from '../../../ChippingInput';
import { useTimezoneValidation } from '../../../utilities/useValidation';
import { isNtpServerValid } from '../../../validators';

const NtpServersInput = () => {
  const ntpServers = useAppSelector(selectNtpServers);

  const stepValidation = useTimezoneValidation();

  return (
    <FormGroup isRequired={false} label="NTP servers">
      <ChippingInput
        ariaLabel="Add NTP server"
        placeholder="Add NTP servers"
        validator={isNtpServerValid}
        list={ntpServers}
        item="NTP server"
        addAction={addNtpServer}
        removeAction={removeNtpServer}
        stepValidation={stepValidation}
        fieldName="ntpServers"
      />
    </FormGroup>
  );
};

export default NtpServersInput;
