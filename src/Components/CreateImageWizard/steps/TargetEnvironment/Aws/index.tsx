import React, { useState } from 'react';

import {
  Radio,
  Text,
  Form,
  Title,
  FormGroup,
  TextInput,
  Gallery,
  GalleryItem,
  HelperText,
  HelperTextItem,
  Button,
  Select,
  SelectOption,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { AwsAccountId } from './AwsAccountId';
import { AwsSourcesSelect } from './AwsSourcesSelect';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeAwsAccountId,
  changeAwsRegion,
  changeAwsShareMethod,
  changeAwsSourceId,
  selectAwsAccountId,
  selectAwsRegion,
  selectAwsShareMethod,
} from '../../../../../store/wizardSlice';
import { ValidatedInput } from '../../../ValidatedInput';
import { isAwsAccountIdValid } from '../../../validators';

export type AwsShareMethod = 'manual' | 'sources';

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

const Aws = () => {
  const dispatch = useAppDispatch();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const shareMethod = useAppSelector(selectAwsShareMethod);
  const shareWithAccount = useAppSelector(selectAwsAccountId);
  const shareRegion = useAppSelector(selectAwsRegion);

  const onToggleClick = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  const handleSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | undefined
  ) => {
    dispatch(changeAwsRegion(value));
    setIsSelectOpen(false);
  };

  const toggleSelect = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isSelectOpen}
    >
      {shareRegion}
    </MenuToggle>
  );

  const awsRegions = () => {
    // TODO: maybe add more regions
    const regions = [
      'us-east-1',
      'us-east-2',
      'us-west-1',
      'us-west-2',
      'eu-central-1',
      'eu-central-2',
      'eu-west-1',
      'eu-west-2',
      'eu-west-3',
    ];
    return regions.map((region) => (
      <SelectOption value={region}>{region}</SelectOption>
    ));
  };

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Target environment - Amazon Web Services
      </Title>
      <Text>
        Your image will be uploaded to AWS and shared with the account you
        provide below.
      </Text>
      <Text>
        <b>The shared image will expire within 14 days.</b> To permanently
        access the image, copy the image, which will be shared to your account
        by Red Hat, to your own AWS account.
      </Text>
      <FormGroup label="Share method:">
        {!process.env.IS_ON_PREMISE && (
          <Radio
            id="radio-with-description"
            label="Use an account configured from Sources."
            name="radio-7"
            description="Use a configured source to launch environments directly from the console."
            isChecked={shareMethod === 'sources'}
            onChange={() => {
              dispatch(changeAwsSourceId(undefined));
              dispatch(changeAwsAccountId(''));
              dispatch(changeAwsShareMethod('sources'));
            }}
            autoFocus
          />
        )}
        <Radio
          id="radio"
          label="Manually enter an account ID."
          name="radio-8"
          isChecked={shareMethod === 'manual'}
          onChange={() => {
            dispatch(changeAwsSourceId(undefined));
            dispatch(changeAwsAccountId(''));
            dispatch(changeAwsShareMethod('manual'));
          }}
          autoFocus={!!process.env.IS_ON_PREMISE}
        />
      </FormGroup>
      {shareMethod === 'sources' && (
        <>
          <AwsSourcesSelect />
          <SourcesButton />
          <Gallery hasGutter>
            <GalleryItem>
              <FormGroup label="Default region" isRequired>
                <TextInput
                  readOnlyVariant="default"
                  isRequired
                  id="someid"
                  value="us-east-1"
                />
              </FormGroup>
              <HelperText>
                <HelperTextItem component="div" variant="indeterminate">
                  Images are built in the default region but can be copied to
                  other regions later.
                </HelperTextItem>
              </HelperText>
            </GalleryItem>
            <GalleryItem>
              <AwsAccountId />
            </GalleryItem>
          </Gallery>
        </>
      )}
      {shareMethod === 'manual' && (
        <>
          <FormGroup label="AWS account ID" isRequired>
            <ValidatedInput
              ariaLabel="aws account id"
              value={shareWithAccount || ''}
              validator={isAwsAccountIdValid}
              onChange={(_event, value) => dispatch(changeAwsAccountId(value))}
              helperText="Should be 12 characters long."
            />
          </FormGroup>
          {!process.env.IS_ON_PREMISE && (
            <FormGroup label="Default region" isRequired>
              <TextInput
                value={'us-east-1'}
                type="text"
                aria-label="default region"
                readOnlyVariant="default"
              />
            </FormGroup>
          )}
          {process.env.IS_ON_PREMISE && (
            <FormGroup label="Default region" isRequired>
              <Select
                isOpen={isSelectOpen}
                onSelect={handleSelect}
                onOpenChange={(isOpen) => setIsSelectOpen(isOpen)}
                selected={shareRegion || ''}
                aria-label="default region"
                toggle={toggleSelect}
                shouldFocusFirstItemOnOpen={false}
              >
                {awsRegions()}
              </Select>
            </FormGroup>
          )}
        </>
      )}
    </Form>
  );
};

export default Aws;
