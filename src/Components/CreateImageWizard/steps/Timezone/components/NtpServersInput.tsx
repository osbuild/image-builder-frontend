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

const NtpServersInput = () => {
  const dispatch = useAppDispatch();
  const ntpServers = useAppSelector(selectNtpServers);
  const [inputValue, setInputValue] = useState('');

  const onTextInputChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string
  ) => {
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (ntpServers?.includes(value)) {
        // TO DO error
      } else {
        dispatch(addNtpServer(value));
        setInputValue('');
      }
    }
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
      <HelperText>
        <HelperTextItem variant="indeterminate">
          Confirm the NTP server by pressing space, comma or enter.
        </HelperTextItem>
      </HelperText>
    </FormGroup>
  );
};

export default NtpServersInput;
