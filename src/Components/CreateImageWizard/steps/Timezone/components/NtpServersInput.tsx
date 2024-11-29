import React, { useState } from 'react';

import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
  HelperText,
  HelperTextItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addNtpServer,
  clearNtpServers,
  removeNtpServer,
  selectNtpServers,
} from '../../../../../store/wizardSlice';
import { isNtpServerValid } from '../../../validators';

const NtpServersInput = () => {
  const dispatch = useAppDispatch();
  const ntpServers = useAppSelector(selectNtpServers);
  const [inputValue, setInputValue] = useState('');
  const [errorText, setErrorText] = useState('');

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();

      if (isNtpServerValid(value) && !ntpServers?.includes(value)) {
        dispatch(addNtpServer(value));
        setInputValue('');
        setErrorText('');
      }

      if (ntpServers?.includes(value)) {
        setErrorText('NTP server already exists.');
      }

      if (!isNtpServerValid(value)) {
        setErrorText('Invalid format.');
      }
    }
  };

  const composeHelperText = () => {
    const addServerHelperText =
      'Confirm the NTP server by pressing space, comma or enter.';
    return (
      <HelperText>
        <HelperTextItem variant={errorText ? 'error' : 'indeterminate'}>
          {errorText ? errorText : addServerHelperText}
        </HelperTextItem>
      </HelperText>
    );
  };

  return (
    <FormGroup isRequired={false} label="NTP servers">
      <TextInputGroup>
        <TextInputGroupMain
          placeholder="Add NTP servers"
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
        >
          <ChipGroup>
            {ntpServers?.map((server) => (
              <Chip
                key={server}
                onClick={() => dispatch(removeNtpServer(server))}
              >
                {server}
              </Chip>
            ))}
          </ChipGroup>
        </TextInputGroupMain>
        {ntpServers && ntpServers.length > 0 && (
          <TextInputGroupUtilities>
            <Button
              variant="plain"
              onClick={() => dispatch(clearNtpServers())}
              aria-label="Remove all NTP servers"
            >
              <TimesIcon />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
      {composeHelperText()}
    </FormGroup>
  );
};

export default NtpServersInput;
