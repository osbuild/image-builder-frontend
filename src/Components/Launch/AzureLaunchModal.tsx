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
import { isAzureUploadStatus } from '../../store/typeGuards';

type LaunchProps = {
  compose: ComposesResponseItem;
};

export const AzureLaunchModal = ({ compose }: LaunchProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isSuccess, isFetching } = useGetComposeStatusQuery({
    composeId: compose.id,
  });

  if (!isSuccess) {
    return <Skeleton />;
  }

  const options = data?.image_status.upload_status?.options;

  if (options && !isAzureUploadStatus(options)) {
    throw TypeError(
      `Error: options must be of type AzureUploadStatus, not ${typeof options}.`,
    );
  }

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <Fragment>
      <Button
        variant='link'
        isInline
        isDisabled={data?.image_status.status !== 'success'}
        onClick={handleModalToggle}
      >
        Launch
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        variant={ModalVariant.large}
        aria-label='Open launch guide wizard'
      >
        <ModalHeader
          title={'Launch with Microsoft Azure'}
          labelId='modal-title'
          description={compose.image_name}
        />
        <ModalBody id='modal-box-body-basic'>
          <List component={ListComponent.ol} type={OrderType.number}>
            <ListItem>
              Locate{' '}
              {!isFetching && (
                <span className='pf-v6-u-font-weight-bold'>
                  {options?.image_name}{' '}
                </span>
              )}
              {isFetching && <Skeleton />}
              in the{' '}
              <Button
                component='a'
                target='_blank'
                variant='link'
                icon={<ExternalLinkAltIcon />}
                iconPosition='right'
                href={`https://portal.azure.com/#view/Microsoft_Azure_ComputeHub/ComputeHubMenuBlade/~/imagesBrowse`}
                className='pf-v6-u-pl-0'
              >
                Azure console
              </Button>
              .
            </ListItem>
            <ListItem>
              Create a Virtual Machine (VM) by using the image.
              <br />
              Note: Review the{' '}
              <span className='pf-v6-u-font-weight-bold'>
                Availability Zone
              </span>{' '}
              and the <span className='pf-v6-u-font-weight-bold'>Size</span> to
              meet your requirements. Adjust these settings as needed.
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
