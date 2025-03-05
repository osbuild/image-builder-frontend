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
import { HookValidatedInput } from '../../../ValidatedInput';

const SatelliteRegistrationCommand = () => {
  const dispatch = useAppDispatch();
  const registrationCommand = useAppSelector(
    selectSatelliteRegistrationCommand
  );
  const stepValidation = useRegistrationValidation();

  const handleChange = (e: React.FormEvent, value: string) => {
    dispatch(changeSatelliteRegistrationCommand(value));
  };

  return (
    <FormGroup label="Registration command from Satellite" isRequired>
      <HookValidatedInput
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
          {/* TODO: Add link to our docs */}
          <HelperTextItem>
            To generate command from Satellite, follow the documentation.
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default SatelliteRegistrationCommand;
