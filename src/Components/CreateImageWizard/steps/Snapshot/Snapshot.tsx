import React from 'react';

import {
  Button,
  DatePicker,
  Flex,
  FormGroup,
  Grid,
  Radio,
  Text,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectSnapshotDate,
  selectUseLatest,
  changeUseLatest,
  changeSnapshotDate,
} from '../../../../store/wizardSlice';
import { yyyyMMddFormat } from '../../../../Utilities/time';
import { isSnapshotDateValid } from '../../validators';

export default function Snapshot() {
  const dispatch = useAppDispatch();
  const snapshotDate = useAppSelector(selectSnapshotDate);

  const useLatest = useAppSelector(selectUseLatest);
  return (
    <>
      <FormGroup>
        <Radio
          id="use latest snapshot radio"
          ouiaId="use-latest-snapshot-radio"
          name="use-latest-snapshot"
          label="Disable repeatable build."
          description="Use the newest repository content available when building this image."
          isChecked={useLatest}
          onChange={() => !useLatest && dispatch(changeUseLatest(true))}
        />
        <Radio
          id="use snapshot date radio"
          ouiaId="use-snapshot-date-radio"
          name="use-snapshot-date"
          label="Enable repeatable build"
          description="Build this image with the repository content of a selected date."
          isChecked={!useLatest}
          onChange={() => useLatest && dispatch(changeUseLatest(false))}
        />
      </FormGroup>
      {useLatest ? (
        <>
          <Title headingLevel="h1" size="xl">
            Use latest content
          </Title>
          <Grid>
            <Text>
              Image Builder will automatically use the newest state of
              repositories when building this image.
            </Text>
          </Grid>
        </>
      ) : (
        <>
          <Title headingLevel="h1" size="xl">
            Use a snapshot
          </Title>
          <FormGroup label="Select snapshot date" isRequired>
            <Flex
              direction={{ default: 'row' }}
              alignContent={{ default: 'alignContentCenter' }}
            >
              <DatePicker
                id="snapshot-date-picker"
                name="pick-snapshot-date"
                value={snapshotDate ? snapshotDate.split('T')[0] : ''}
                required
                requiredDateOptions={{ isRequired: true }}
                placeholder="YYYY-MM-DD"
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
                variant="link"
                onClick={async () => {
                  //Patternfly DatePicker seems to only clear error text if value is reset to '',
                  // if you have an invalid date (2000-01-010000) and try to reset it, it must be set to '' first
                  dispatch(changeSnapshotDate(''));
                  setTimeout(() => {
                    dispatch(changeSnapshotDate(yyyyMMddFormat(new Date())));
                  }, 1);
                }}
              >
                Reset
              </Button>
            </Flex>
          </FormGroup>
          <Grid>
            <Text>
              Image Builder will reflect the state of repositories based on the
              selected date when building this image.
            </Text>
          </Grid>
        </>
      )}
    </>
  );
}
