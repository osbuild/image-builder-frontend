import React from 'react';

import { Radio, Text, Form, Title, FormGroup } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeGcpAccountType,
  changeGcpEmail,
  changeGcpShareMethod,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
} from '../../../../../store/wizardSlice';
import { ValidatedTextInput } from '../../../ValidatedTextInput';
import { isGcpEmailValid } from '../../../validators';

export type GcpShareMethod = 'withGoogle' | 'withInsights';
export type GcpAccountType =
  | 'google'
  | 'service'
  | 'group'
  | 'domain'
  | undefined;

const Gcp = () => {
  const dispatch = useAppDispatch();

  const accountType = useAppSelector((state) => selectGcpAccountType(state));
  const shareMethod = useAppSelector((state) => selectGcpShareMethod(state));
  const gcpEmail = useAppSelector((state) => selectGcpEmail(state));

  return (
    <Form>
      <Title headingLevel="h2">
        Target environment - Google Cloud Platform
      </Title>
      <Text>
        Select how to share your image. The image you create can be used to
        launch instances on GCP, regardless of which method you select.
      </Text>
      <FormGroup label="Select image sharing" isRequired>
        <Radio
          id="radio-with-description"
          label="Share image with a Google acount"
          name="radio-7"
          description={
            <Text>
              Your image will be uploaded to GCP and shared with the account you
              provide below.
              <b>The image expires in 14 days.</b> To keep permanent access to
              your image, copy it to your GCP project.
            </Text>
          }
          isChecked={shareMethod === 'withGoogle'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withGoogle'));
          }}
        />
        <Radio
          id="radio"
          label="Share image with Red Hat Insights only"
          name="radio-8"
          description={
            <Text>
              Your image will be uploaded to GCP and shared with Red Hat
              Insights.
              <b> The image expires in 14 days.</b> You cannot access or
              recreate this image in your GCP project.
            </Text>
          }
          isChecked={shareMethod === 'withInsights'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withInsights'));
          }}
        />
      </FormGroup>
      {shareMethod === 'withGoogle' && (
        <>
          <FormGroup label="Account type" isRequired>
            <Radio
              id="google"
              label="Google account"
              name="radio-9"
              isChecked={accountType === 'google'}
              onChange={() => {
                dispatch(changeGcpAccountType('google'));
              }}
            />
            <Radio
              id="service"
              label="Service account"
              name="radio-10"
              isChecked={accountType === 'service'}
              onChange={() => {
                dispatch(changeGcpAccountType('service'));
              }}
            />
            <Radio
              id="group"
              label="Google group"
              name="radio-11"
              isChecked={accountType === 'group'}
              onChange={() => {
                dispatch(changeGcpAccountType('group'));
              }}
            />
            <Radio
              id="domain"
              label="Google Workspace domain or Cloud Identity domain"
              name="radio-12"
              isChecked={accountType === 'domain'}
              onChange={() => {
                dispatch(changeGcpAccountType('domain'));
              }}
            />
          </FormGroup>
          <FormGroup
            label={
              accountType === 'domain'
                ? 'Domain'
                : 'Principal (e.g. e-mail address)'
            }
            isRequired
          >
            <ValidatedTextInput
              ariaLabel="principal"
              value={gcpEmail || ''}
              validator={isGcpEmailValid}
              onChange={(_event, value) => dispatch(changeGcpEmail(value))}
              helperText="Please enter a valid e-mail address."
            />
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Gcp;
