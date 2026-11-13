import React, { useEffect, useState } from 'react';

import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import ExternalLinkButton from '@/Components/CreateImageWizard/utilities/ExternalLinkButton';
import { ValidatedTextArea } from '@/Components/ValidatedInputs';
import { REGISTRATION_DOCS_URL, SATELLITE_SERVICE } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addEnabledService,
  changeSatelliteRegistrationCommand,
  removeEnabledService,
  selectSatelliteRegistrationCommand,
  validateSatelliteCommand,
} from '@/store/slices/wizard';

const SatelliteRegistrationCommand = () => {
  const dispatch = useAppDispatch();
  const command = useAppSelector(selectSatelliteRegistrationCommand);
  const [draft, setDraft] = useState(command ?? '');

  useEffect(() => {
    // Reset local drafts when the command changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(command ?? '');
  }, [command]);

  return (
    <FormGroup label='Satellite registration command' isRequired>
      <ValidatedTextArea
        id='command'
        ariaLabel='registration command'
        value={draft}
        onChange={(_, value) => setDraft(value)}
        validator={(value) => validateSatelliteCommand(value)}
        onCommit={(candidate) => {
          if (!candidate) return;

          dispatch(addEnabledService(SATELLITE_SERVICE));
          dispatch(changeSatelliteRegistrationCommand(candidate));
        }}
        onClear={() => {
          dispatch(removeEnabledService(SATELLITE_SERVICE));
          dispatch(changeSatelliteRegistrationCommand(''));
        }}
      />
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            To generate command from Satellite, follow the{' '}
            <ExternalLinkButton
              url={REGISTRATION_DOCS_URL}
              analyticsStepId='step-register'
            >
              documentation
            </ExternalLinkButton>
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default SatelliteRegistrationCommand;
