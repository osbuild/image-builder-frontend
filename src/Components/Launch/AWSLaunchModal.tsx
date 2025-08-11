import React from 'react';

import {
  Button,
  List,
  ListComponent,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  OrderType,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import {
  ComposesResponseItem,
  ComposeStatus,
} from '../../store/imageBuilderApi';
import { isAwsUploadRequestOptions } from '../../store/typeGuards';

type LaunchProps = {
  isOpen: boolean;
  handleModalToggle: (event: KeyboardEvent | React.MouseEvent) => void;
  compose: ComposesResponseItem;
  composeStatus: ComposeStatus | undefined;
};

export const AWSLaunchModal = ({
  isOpen,
  handleModalToggle,
  compose,
  composeStatus,
}: LaunchProps) => {
  const options = compose.request.image_requests[0].upload_request.options;

  if (!isAwsUploadRequestOptions(options)) {
    throw TypeError(
      `Error: options must be of type AwsUploadRequestOptions, not ${typeof options}.`,
    );
  }

  const amiId =
    composeStatus?.image_status.status === 'success' &&
    composeStatus.image_status.upload_status?.options &&
    'ami' in composeStatus.image_status.upload_status.options
      ? composeStatus.image_status.upload_status.options.ami
      : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalToggle}
      variant={ModalVariant.large}
      aria-label='Open launch guide modal'
    >
      <ModalHeader
        title={'Launch with Amazon Web Services'}
        labelId='modal-title'
        description={compose.image_name}
      />
      <ModalBody id='modal-box-body-basic'>
        <List component={ListComponent.ol} type={OrderType.number}>
          <ListItem>
            Navigate to the{' '}
            <Button
              component='a'
              target='_blank'
              variant='link'
              icon={<ExternalLinkAltIcon />}
              iconPosition='right'
              href={`https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#ImageDetails:imageId=${amiId}`}
              className='pf-v6-u-pl-0'
            >
              Images detail page
            </Button>{' '}
            located on your AWS console.
          </ListItem>
          <ListItem>
            Copy the image to make it a permanent copy in your account.
            <br />
            Shared with Account{' '}
            <span className='pf-v6-u-font-weight-bold'>
              {options.share_with_accounts?.[0]}
            </span>
            <br />
            AMI ID: <span className='pf-v6-u-font-weight-bold'>{amiId}</span>
          </ListItem>
          <ListItem>Launch image as an instance.</ListItem>
          <ListItem>
            Connect to it via SSH using the following username:{' '}
            <span className='pf-v6-u-font-weight-bold'>ec2-user</span>
          </ListItem>
        </List>
      </ModalBody>
      <ModalFooter>
        <Button key='close' variant='primary' onClick={handleModalToggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
