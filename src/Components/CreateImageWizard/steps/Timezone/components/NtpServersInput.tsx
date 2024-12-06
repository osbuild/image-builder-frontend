import React, { useState } from 'react';

import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addNtpServer,
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

  const handleAddServer = (e: React.MouseEvent, value: string) => {
    dispatch(addNtpServer(value));
    setInputValue('');
  };

  return (
    <FormGroup isRequired={false} label="NTP servers">
      <TextInputGroup>
        <TextInputGroupMain
          placeholder="Add NTP servers"
          onChange={onTextInputChange}
          value={inputValue}
          onKeyDown={(e) => handleKeyDown(e, inputValue)}
        />
        <TextInputGroupUtilities>
          <Button
            variant="plain"
            onClick={(e) => handleAddServer(e, inputValue)}
            isDisabled={!inputValue}
            aria-label="Add NTP server"
          >
            <PlusCircleIcon />
          </Button>
          <Button
            variant="plain"
            onClick={() => setInputValue('')}
            isDisabled={!inputValue}
            aria-label="Clear input"
          >
            <TimesIcon />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
      <ChipGroup numChips={5} className="pf-v5-u-mt-sm pf-v5-u-w-100">
        {ntpServers?.map((server) => (
          <Chip key={server} onClick={() => dispatch(removeNtpServer(server))}>
            {server}
          </Chip>
        ))}
      </ChipGroup>
    </FormGroup>
  );
};

export default NtpServersInput;
