import React, { useState } from 'react';

import {
  Button,
  Content,
  DatePicker,
  Flex,
  FormGroup,
  Grid,
  Radio,
  Title,
} from '@patternfly/react-core';

import Templates from './Templates';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeSnapshotDate,
  changeTemplate,
  changeUseLatest,
  selectSnapshotDate,
  selectTemplate,
  selectUseLatest,
} from '../../../../../store/wizardSlice';
import { yyyyMMddFormat } from '../../../../../Utilities/time';
import { useFlag } from '../../../../../Utilities/useGetEnvironment';
import { isSnapshotDateValid } from '../../../validators';

export default function Snapshot() {
  const dispatch = useAppDispatch();
  const snapshotDate = useAppSelector(selectSnapshotDate);

  const useLatest = useAppSelector(selectUseLatest);
  const templateUuid = useAppSelector(selectTemplate);
  const [selectedOption, setSelectedOption] = useState<
    'latest' | 'snapshotDate' | 'template'
  >(useLatest ? 'latest' : templateUuid ? 'template' : 'snapshotDate');

  const isTemplatesEnabled = useFlag('image-builder.templates.enabled');

  const handleOptionChange = (
    option: 'latest' | 'snapshotDate' | 'template',
  ): void => {
    setSelectedOption(option);
    switch (option) {
      case 'latest':
        dispatch(changeUseLatest(true));
        dispatch(changeTemplate(''));
        dispatch(changeSnapshotDate(''));
        break;
      case 'snapshotDate':
        dispatch(changeUseLatest(false));
        dispatch(changeTemplate(''));
        break;
      case 'template':
        dispatch(changeUseLatest(false));
        dispatch(changeSnapshotDate(''));
        break;
    }
  };

  return (
    <>
      <FormGroup>
        <Radio
          id='use latest snapshot radio'
          name='snapshot-type'
          label='Disable repeatable build'
          description='Use the newest repository content available when building this image'
          isChecked={selectedOption === 'latest'}
          onChange={() => handleOptionChange('latest')}
        />
        <Radio
          id='use snapshot date radio'
          name='snapshot-type'
          label='Enable repeatable build'
          description='Build this image with the repository content of a selected date'
          isChecked={selectedOption === 'snapshotDate'}
          onChange={() => handleOptionChange('snapshotDate')}
        />
        {isTemplatesEnabled ? (
          <Radio
            id='use content template radio'
            ouiaId='use-content-template-radio'
            name='snapshot-type'
            label='Use a content template'
            description='Select a content template and build this image with repository snapshots included in that template'
            isChecked={selectedOption === 'template'}
            onChange={() => handleOptionChange('template')}
          />
        ) : (
          <></>
        )}
      </FormGroup>

      {selectedOption === 'latest' ? (
        <>
          <Title headingLevel='h1' size='xl'>
            Use latest content
          </Title>
          <Grid>
            <Content>
              Image Builder will automatically use the newest state of
              repositories when building this image.
            </Content>
          </Grid>
        </>
      ) : selectedOption === 'snapshotDate' ? (
        <>
          <Title headingLevel='h1' size='xl'>
            Use a snapshot
          </Title>
          <FormGroup label='Select snapshot date' isRequired>
            <Flex
              direction={{ default: 'row' }}
              alignContent={{ default: 'alignContentCenter' }}
            >
              <DatePicker
                id='snapshot-date-picker'
                name='pick-snapshot-date'
                value={snapshotDate ? snapshotDate.split('T')[0] : ''}
                required
                requiredDateOptions={{ isRequired: true }}
                placeholder='YYYY-MM-DD'
                validators={[
                  (date: Date) => {
                    if (!isSnapshotDateValid(date)) {
                      return 'Cannot set a date in the future';
                    }
                    return '';
                  },
                ]}
                onChange={(_, val) => dispatch(changeSnapshotDate(val))}
              />

              <Button
                variant='link'
                onClick={async () => {
                  //Patternfly DatePicker seems to only clear error text if value is reset to '',
                  // if you have an invalid date (2000-01-010000) and try to reset it, it must be set to '' first
                  dispatch(changeSnapshotDate(yyyyMMddFormat(new Date())));
                }}
              >
                Reset
              </Button>
            </Flex>
          </FormGroup>
          <Grid>
            <Content>
              Image Builder will reflect the state of repositories based on the
              selected date when building this image.
            </Content>
          </Grid>
        </>
      ) : isTemplatesEnabled && selectedOption === 'template' ? (
        <>
          <Title headingLevel='h1' size='xl'>
            Use a content template
          </Title>
          <Templates />
        </>
      ) : (
        <></>
      )}
    </>
  );
}
