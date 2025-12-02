import React from 'react';

import {
  Content,
  ContentVariants,
  Form,
  FormGroup,
  Radio,
  Title,
} from '@patternfly/react-core';
import { useFlag } from '@unleash/proxy-client-react';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeGcpAccountType,
  changeGcpEmail,
  changeGcpShareMethod,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
} from '../../../../../store/wizardSlice';
import { ValidatedInput } from '../../../ValidatedInput';
import { isGcpDomainValid, isGcpEmailValid } from '../../../validators';

export type GcpShareMethod = 'withGoogle' | 'withInsights';
export type GcpAccountType =
  | 'user'
  | 'serviceAccount'
  | 'group'
  | 'domain'
  | undefined;

const Gcp = () => {
  const lightspeedEnabled = useFlag('platform.lightspeed-rebrand');

  const dispatch = useAppDispatch();

  const accountType = useAppSelector(selectGcpAccountType);
  const shareMethod = useAppSelector(selectGcpShareMethod);
  const gcpEmail = useAppSelector(selectGcpEmail);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Target environment - Google Cloud
      </Title>
      <Content>
        Select how to share your image. The image you create can be used to
        launch instances on GCP, regardless of which method you select.
      </Content>
      <FormGroup label='Select image sharing' isRequired>
        <Radio
          id='share-with-google'
          label='Share image with a Google account'
          name='radio-1'
          description={
            <Content component={ContentVariants.small}>
              Your image will be uploaded to GCP and shared with the account you
              provide below.
              <b>The image expires in 14 days.</b> To keep permanent access to
              your image, copy it to your GCP project.
            </Content>
          }
          isChecked={shareMethod === 'withGoogle'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withGoogle'));
          }}
          autoFocus
        />
        <Radio
          id='share-with-insights'
          label={`Share image with Red Hat ${lightspeedEnabled ? 'Lightspeed' : 'Insights'} only`}
          name='radio-2'
          description={
            <Content component={ContentVariants.small}>
              Your image will be uploaded to GCP and shared with Red Hat{' '}
              {lightspeedEnabled ? 'Lightspeed' : 'Insights'}.
              <b> The image expires in 14 days.</b> You cannot access or
              recreate this image in your GCP project.
            </Content>
          }
          isChecked={shareMethod === 'withInsights'}
          onChange={() => {
            dispatch(changeGcpShareMethod('withInsights'));
          }}
        />
      </FormGroup>
      {shareMethod === 'withGoogle' && (
        <>
          <FormGroup label='Account type' isRequired>
            <Radio
              id='google-account'
              label='Google account'
              name='radio-3'
              isChecked={accountType === 'user'}
              onChange={() => {
                dispatch(changeGcpAccountType('user'));
              }}
            />
            <Radio
              id='service-account'
              label='Service account'
              name='radio-4'
              isChecked={accountType === 'serviceAccount'}
              onChange={() => {
                dispatch(changeGcpAccountType('serviceAccount'));
              }}
            />
            <Radio
              id='google-group'
              label='Google group'
              name='radio-5'
              isChecked={accountType === 'group'}
              onChange={() => {
                dispatch(changeGcpAccountType('group'));
              }}
            />
            <Radio
              id='google-domain'
              label='Google Workspace domain'
              name='radio-6'
              isChecked={accountType === 'domain'}
              onChange={() => {
                dispatch(changeGcpAccountType('domain'));
              }}
            />
          </FormGroup>
          <FormGroup
            label={
              accountType === 'domain' ? 'Domain' : 'Principal (e-mail address)'
            }
            isRequired
          >
            <ValidatedInput
              ariaLabel='google principal'
              dataTestId='principal'
              value={gcpEmail || ''}
              validator={
                accountType === 'domain' ? isGcpDomainValid : isGcpEmailValid
              }
              onChange={(_event, value) => dispatch(changeGcpEmail(value))}
              helperText={
                !gcpEmail
                  ? accountType === 'domain'
                    ? 'Domain is required'
                    : 'E-mail address is required'
                  : accountType === 'domain'
                    ? 'Please enter a valid domain'
                    : 'Please enter a valid e-mail address'
              }
            />
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Gcp;
