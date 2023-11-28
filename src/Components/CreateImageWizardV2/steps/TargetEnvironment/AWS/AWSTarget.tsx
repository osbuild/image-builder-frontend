import React, { useContext } from 'react';

import {
  Alert,
  Button,
  Form,
  FormGroup,
  Gallery,
  GalleryItem,
  HelperText,
  HelperTextItem,
  Radio,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { DEFAULT_AWS_REGION } from '../../../../../constants';
import { useGetSourceListQuery } from '../../../../../store/provisioningApi';
import ValidatedTextField from '../../../common/ValidatedTextField';
import { ImageWizardContext } from '../../../ImageWizardContext';
import { SourcesSelect, useGetAccountData } from '../SourcesSelect';

const SourcesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={'settings/sources'}
    >
      Create and manage sources here
    </Button>
  );
};

export const ValidateAWSStep = (): boolean => {
  const { associatedAwsAccountIdState } = useContext(ImageWizardContext);
  const [associatedAccountId] = associatedAwsAccountIdState;
  return validateAWSAccountID(associatedAccountId);
};

const validateAWSAccountID = (accountId: string) => {
  return /^\d+$/.test(accountId) && accountId.length === 12;
};

const AWSTarget = () => {
  const { isAwsManualState, associatedAwsAccountIdState, awsSourceState } =
    useContext(ImageWizardContext);
  const [associatedAccountId, setAssociatedAccountId] =
    associatedAwsAccountIdState;
  const [source, setSource] = awsSourceState;
  const [isManual, setIsManual] = isAwsManualState;
  const { isError: isErrorFetchingDetails } = useGetAccountData(
    source[0],
    'aws'
  );
  const { isError: isErrorFetchingSources } = useGetSourceListQuery({
    provider: 'aws',
  });
  const clearAwsTarget = () => {
    // reset the selected source state so the UI doesn't keep
    // previously entered data when the user goes back to their
    // previous choice
    setAssociatedAccountId('');
    setSource([0, '']);
  };
  return (
    <>
      <Form>
        <Title headingLevel="h2">
          Target environment - Amazon Web Services
        </Title>
        <p>
          Your image will be uploaded to AWS and shared with the account you
          provide below.
        </p>
        <p>
          <b>The shared image will expire within 14 days.</b> To permanently
          access the image, copy the image, which will be shared to your account
          by Red Hat, to your own AWS account.
        </p>
        <FormGroup label="Share method:">
          <Radio
            name="aws-from-sources"
            id="aws-from-sources"
            label="Use an account configured from Sources."
            description="Use a configured source to launch environments directly from the console."
            checked={!isManual}
            isChecked={!isManual}
            onClick={() => {
              setIsManual(false);
              clearAwsTarget();
            }}
          />
          <Radio
            name="aws-from-manual"
            id="aws-from-manual"
            label="Manually enter an account ID."
            checked={isManual}
            isChecked={isManual}
            onClick={() => {
              setIsManual(true);
              clearAwsTarget();
            }}
          />
        </FormGroup>
        {!isManual && (
          <>
            <SourcesSelect
              provider="aws"
              selectedSource={source}
              setSelectedSource={setSource}
            />
            <>
              {isErrorFetchingSources && (
                <Alert
                  variant={'danger'}
                  isPlain={true}
                  isInline={true}
                  title={'Sources unavailable'}
                >
                  Sources cannot be reached, try again later or enter an AWS
                  account ID manually.
                </Alert>
              )}
              {isErrorFetchingDetails && (
                <Alert
                  variant={'danger'}
                  isPlain
                  isInline
                  title={'AWS details unavailable'}
                >
                  The AWS account ID for the selected source could not be
                  resolved. There might be a problem with the source. Verify
                  that the source is valid in Sources or select a different
                  source.
                </Alert>
              )}
            </>
            <SourcesButton />
          </>
        )}
        {isManual && (
          <ValidatedTextField
            aria="AWS account ID"
            label="AWS account ID"
            fieldId="aws-account-id-textbox"
            value={associatedAccountId}
            setValue={setAssociatedAccountId}
            validateFunction={validateAWSAccountID}
            helperText="Account ID must be composed of 12 numbers"
          />
        )}
        <Gallery hasGutter>
          <GalleryItem>
            <FormGroup label="Default Region" isRequired>
              <TextInput
                value={DEFAULT_AWS_REGION}
                type="text"
                readOnlyVariant="default"
                aria-label="Default Region"
                isRequired
              />
              <HelperText>
                <HelperTextItem component="div" variant="indeterminate">
                  Images are built in the default region but can be copied to
                  other regions later.
                </HelperTextItem>
              </HelperText>
            </FormGroup>
          </GalleryItem>
          {!isManual && (
            <GalleryItem>
              <FormGroup label="Associated Account ID" isRequired>
                <TextInput
                  value={associatedAccountId}
                  type="text"
                  readOnlyVariant="default"
                  label="Associated Account ID"
                  aria-label="Associated Account ID"
                  isRequired
                />
                <HelperText>
                  <HelperTextItem component="div" variant="indeterminate">
                    This is the account associated with the source.
                  </HelperTextItem>
                </HelperText>
              </FormGroup>
            </GalleryItem>
          )}
        </Gallery>
      </Form>
    </>
  );
};

export default AWSTarget;
