import React from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeSatelliteRegistrationCommand,
  selectSatelliteRegistrationCommand,
} from '../../../../../store/wizardSlice';
import { useRegistrationValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';

const SatelliteRegistrationCommand = () => {
  const dispatch = useAppDispatch();
  const registrationCommand = useAppSelector(
    selectSatelliteRegistrationCommand
  );
  const stepValidation = useRegistrationValidation();
  const registrationDocs =
    'https://docs.redhat.com/en/documentation/red_hat_satellite/6.16/html-single/managing_hosts/index#Customizing_the_Registration_Templates_managing-hosts';

  const handleChange = (e: React.FormEvent, value: string) => {
    dispatch(changeSatelliteRegistrationCommand(value));
  };

  return (
    <FormGroup label="Registration command from Satellite" isRequired>
      <ValidatedInputAndTextArea
        inputType={'textArea'}
        ariaLabel="registration command"
        value={registrationCommand || ''}
        onChange={handleChange}
        placeholder="Registration command"
        stepValidation={stepValidation}
        fieldName="command"
      />
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            To generate command from Satellite, follow the{' '}
            <a href={registrationDocs} target="_blank" rel="noreferrer">
              documentation
            </a>
            .
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default SatelliteRegistrationCommand;
