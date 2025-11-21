import React from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import ManageButton from './ManageButton';

import {
  REGISTRATION_DOCS_URL,
  SATELLITE_SERVICE,
} from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addEnabledService,
  changeSatelliteRegistrationCommand,
  removeEnabledService,
  selectSatelliteRegistrationCommand,
} from '../../../../../store/wizardSlice';
import { useRegistrationValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';

const SatelliteRegistrationCommand = () => {
  const dispatch = useAppDispatch();
  const registrationCommand = useAppSelector(
    selectSatelliteRegistrationCommand,
  );
  const stepValidation = useRegistrationValidation();

  const handleChange = (e: React.FormEvent, value: string) => {
    if (!registrationCommand && !!value) {
      dispatch(addEnabledService(SATELLITE_SERVICE));
    } else if (!!registrationCommand && !value) {
      dispatch(removeEnabledService(SATELLITE_SERVICE));
    }
    dispatch(changeSatelliteRegistrationCommand(value));
  };

  return (
    <FormGroup label='Satellite registration command' isRequired>
      <ValidatedInputAndTextArea
        inputType={'textArea'}
        ariaLabel='registration command'
        value={registrationCommand || ''}
        onChange={handleChange}
        placeholder='Input field'
        stepValidation={stepValidation}
        fieldName='command'
        warning={stepValidation.errors.expired}
      />
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            To generate command from Satellite, follow the{' '}
            <ManageButton
              url={REGISTRATION_DOCS_URL}
              analyticsStepId='step-register'
            >
              documentation
            </ManageButton>
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default SatelliteRegistrationCommand;
