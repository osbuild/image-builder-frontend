import React, { Fragment, useState } from 'react';

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
  Skeleton,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import { isAwsUploadRequestOptions } from '../../store/typeGuards';

type LaunchProps = {
  compose: ComposesResponseItem;
};

export const AWSLaunchModal = ({ compose }: LaunchProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isSuccess, isFetching } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const options = data.image_status.upload_status?.options;

  if (options && !isAwsUploadRequestOptions(options)) {
    throw TypeError(
      `Error: options must be of type AwsUploadRequestOptions, not ${typeof options}.`,
    );
  }

  const amiId =
    data.image_status.status === 'success' &&
    data.image_status.upload_status?.options &&
    'ami' in data.image_status.upload_status.options
      ? data.image_status.upload_status.options.ami
      : '';

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <Fragment>
      <Button
        variant='link'
        isInline
        isDisabled={data.image_status.status !== 'success'}
        onClick={handleModalToggle}
      >
        Launch
      </Button>

      <Modal
        isOpen={isModalOpen}
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
              {!isFetching && (
                <span className='pf-v6-u-font-weight-bold'>
                  {options?.share_with_accounts?.[0]}
                </span>
              )}
              {isFetching && <Skeleton />}
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
    </Fragment>
  );
};
