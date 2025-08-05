import React from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import { SATELLITE_SERVICE } from '../../../../../constants';
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
  const registrationDocs =
    'https://docs.redhat.com/en/documentation/red_hat_satellite/6.16/html-single/managing_hosts/index#Customizing_the_Registration_Templates_managing-hosts';

  const handleChange = (e: React.FormEvent, value: string) => {
    if (!registrationCommand && !!value) {
      dispatch(addEnabledService(SATELLITE_SERVICE));
    } else if (!!registrationCommand && !value) {
      dispatch(removeEnabledService(SATELLITE_SERVICE));
    }
    dispatch(changeSatelliteRegistrationCommand(value));
  };

  return (
    <FormGroup label='Registration command from Satellite' isRequired>
      <ValidatedInputAndTextArea
        inputType={'textArea'}
        ariaLabel='registration command'
        value={registrationCommand || ''}
        onChange={handleChange}
        placeholder='Registration command'
        stepValidation={stepValidation}
        fieldName='command'
        warning={stepValidation.errors.expired}
      />
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            To generate command from Satellite, follow the{' '}
            <a href={registrationDocs} target='_blank' rel='noreferrer'>
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
