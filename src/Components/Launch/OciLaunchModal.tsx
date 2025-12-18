import React, { Fragment, useState } from 'react';

import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
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
import { useNavigate } from 'react-router-dom';

import {
  ComposesResponseItem,
  useGetComposeStatusQuery,
} from '../../store/imageBuilderApi';
import { isOciUploadStatus } from '../../store/typeGuards';
import { resolveRelPath } from '../../Utilities/path';

type LaunchProps = {
  isExpired: boolean;
  compose: ComposesResponseItem;
};

export const OciLaunchModal = ({ isExpired, compose }: LaunchProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isSuccess, isFetching } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  const navigate = useNavigate();
  if (!isSuccess) {
    return <Skeleton />;
  }

  const options = data.image_status.upload_status?.options;

  if (options && !isOciUploadStatus(options)) {
    throw TypeError(
      `Error: options must be of type OciUploadStatus, not ${typeof options}.`,
    );
  }

  if (isExpired) {
    return (
      <Button
        component='a'
        target='_blank'
        variant='link'
        onClick={() => navigate(resolveRelPath(`imagewizard/${compose.id}`))}
        isInline
      >
        Recreate image
      </Button>
    );
  }

  const handleModalToggle = () => {
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
        Image link
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        variant={ModalVariant.large}
        aria-label='Open launch guide modal'
      >
        <ModalHeader
          title={'Launch with Oracle Cloud Infrastructure'}
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
                href={`https://cloud.oracle.com/compute/images`}
                className='pf-v6-u-pl-0'
              >
                Oracle Cloud&apos;s Custom Images
              </Button>{' '}
              page.
            </ListItem>
            <ListItem>
              Select{' '}
              <span className='pf-v6-u-font-weight-bold'>Import image</span>,
              and enter the Object Storage URL of the image.
              {!isFetching && (
                <ClipboardCopy
                  isReadOnly
                  isExpanded
                  hoverTip='Copy'
                  clickTip='Copied'
                  variant={ClipboardCopyVariant.expansion}
                >
                  {options?.url || ''}
                </ClipboardCopy>
              )}
              {isFetching && <Skeleton />}
            </ListItem>
            <ListItem>
              After the image is available, click on{' '}
              <span className='pf-v6-u-font-weight-bold'>Create instance</span>.
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
