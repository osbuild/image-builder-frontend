import React, { useState } from 'react';

import {
  Button,
  Content,
  Form,
  FormGroup,
  Gallery,
  GalleryItem,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Radio,
  Select,
  SelectOption,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { AwsAccountId } from './AwsAccountId';
import { AwsSourcesSelect } from './AwsSourcesSelect';

import { AWS_REGIONS } from '../../../../../constants';
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

type FormGroupProps<T> = {
  value: string;
  onChange: (value: T) => void;
};

const AWSRegion = ({ value, onChange }: FormGroupProps<string>) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    onChange(value as string);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      style={
        {
          width: '100%',
        } as React.CSSProperties
      }
    >
      {value}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={value}
      onSelect={onSelect}
      onOpenChange={() => setIsOpen(!isOpen)}
      toggle={toggle}
    >
      {AWS_REGIONS.map(({ description, value: region }) => (
        <SelectOption key={description} value={region}>
          {region}
        </SelectOption>
      ))}
    </Select>
  );
};

const Aws = () => {
  const dispatch = useAppDispatch();

  const shareMethod = useAppSelector(selectAwsShareMethod);
  const shareWithAccount = useAppSelector(selectAwsAccountId);
  const region = useAppSelector(selectAwsRegion);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Target environment - Amazon Web Services
      </Title>
      <Content>
        Your image will be uploaded to AWS and shared with the account you
        provide below.
      </Content>
      {!process.env.IS_ON_PREMISE && (
        <>
          <Content>
            <b>The shared image will expire within 14 days.</b> To permanently
            access the image, copy the image, which will be shared to your
            account by Red Hat, to your own AWS account.
          </Content>
          <FormGroup label="Share method:">
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
        </>
      )}
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
                <HelperTextItem component="div" variant="default">
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
          {!process.env.IS_ON_PREMISE && (
            <FormGroup label="AWS account ID" isRequired>
              <ValidatedInput
                ariaLabel="aws account id"
                value={shareWithAccount || ''}
                validator={isAwsAccountIdValid}
                onChange={(_event, value) =>
                  dispatch(changeAwsAccountId(value))
                }
                helperText="Should be 12 characters long."
              />
            </FormGroup>
          )}
          <FormGroup label="Default region" isRequired>
            {!process.env.IS_ON_PREMISE && (
              <TextInput
                value={'us-east-1'}
                type="text"
                aria-label="default region"
                readOnlyVariant="default"
              />
            )}
            {process.env.IS_ON_PREMISE && (
              <AWSRegion
                value={region || ''}
                onChange={(v) => dispatch(changeAwsRegion(v))}
              />
            )}
          </FormGroup>
        </>
      )}
    </Form>
  );
};

export default Aws;
