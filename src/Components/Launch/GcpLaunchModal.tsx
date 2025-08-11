import React, { useState } from 'react';

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
  TextInput,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { generateDefaultName } from './useGenerateDefaultName';

import {
  ComposesResponseItem,
  ComposeStatus,
} from '../../store/imageBuilderApi';
import {
  isGcpUploadRequestOptions,
  isGcpUploadStatus,
} from '../../store/typeGuards';
import { parseGcpSharedWith } from '../ImagesTable/ImageDetails';

type LaunchProps = {
  isOpen: boolean;
  handleModalToggle: (event: KeyboardEvent | React.MouseEvent) => void;
  compose: ComposesResponseItem;
  composeStatus: ComposeStatus | undefined;
};

export const GcpLaunchModal = ({
  isOpen,
  handleModalToggle,
  compose,
  composeStatus,
}: LaunchProps) => {
  const [customerProjectId, setCustomerProjectId] = useState('');

  const statusOptions = composeStatus?.image_status.upload_status?.options;
  const composeOptions =
    compose.request.image_requests[0].upload_request.options;

  if (
    (statusOptions && !isGcpUploadStatus(statusOptions)) ||
    !isGcpUploadRequestOptions(composeOptions)
  ) {
    throw TypeError(
      `Error: options must be of type GcpUploadRequestOptions, not ${typeof statusOptions}.`,
    );
  }

  const imageName = statusOptions?.image_name;
  const projectId = statusOptions?.project_id;
  if (!imageName || !projectId) {
    throw TypeError(
      `Error: Image name not found, unable to generate a command to copy ${typeof statusOptions}.`,
    );
  }
  const uniqueImageName = generateDefaultName(imageName);
  const authorizeString =
    composeOptions.share_with_accounts &&
    composeOptions.share_with_accounts.length === 1
      ? `Authorize gcloud CLI to the following
            account: ${parseGcpSharedWith(composeOptions.share_with_accounts)}.`
      : composeOptions.share_with_accounts
        ? `Authorize gcloud CLI to use one of the following
            accounts: ${parseGcpSharedWith(composeOptions.share_with_accounts)}.`
        : 'Authorize gcloud CLI to use the account that the image is shared with.';
  const installationCommand = `sudo dnf install google-cloud-cli`;
  const createImage = `gcloud compute images create ${uniqueImageName} --source-image=${imageName} --source-image-project=${projectId} --project=${
    customerProjectId || '<your_project_id>'
  }`;
  const createInstance = `gcloud compute instances create ${uniqueImageName} --image=${uniqueImageName} --project=${
    customerProjectId || '<your_project_id>'
  }`;
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalToggle}
      variant={ModalVariant.large}
      aria-label='Open launch guide modal'
    >
      <ModalHeader
        title={'Launch with Google Cloud Platform'}
        labelId='modal-title'
        description={compose.image_name}
      />
      <ModalBody id='modal-box-body-basic'>
        <List component={ListComponent.ol} type={OrderType.number}>
          <ListItem>
            Install the gcloud CLI. See the{' '}
            <Button
              component='a'
              target='_blank'
              variant='link'
              icon={<ExternalLinkAltIcon />}
              iconPosition='right'
              href={`https://cloud.google.com/sdk/docs/install`}
              className='pf-v6-u-pl-0'
            >
              Install gcloud CLI
            </Button>
            documentation.
            <ClipboardCopy isReadOnly hoverTip='Copy' clickTip='Copied'>
              {installationCommand}
            </ClipboardCopy>
          </ListItem>
          <ListItem>{authorizeString}</ListItem>
          <ListItem>
            Enter your GCP project ID, and run the command to create the image
            in your project.
            <TextInput
              className='pf-v6-u-mt-sm pf-v6-u-mb-md'
              value={customerProjectId}
              type='text'
              onChange={(_event, value) => setCustomerProjectId(value)}
              aria-label='Project ID input'
              placeholder='Project ID'
            />
            <ClipboardCopy
              isReadOnly
              hoverTip='Copy'
              clickTip='Copied'
              variant={ClipboardCopyVariant.expansion}
            >
              {createImage}
            </ClipboardCopy>
          </ListItem>
          <ListItem>
            Create an instance of your image by either accessing the{' '}
            <Button
              component='a'
              target='_blank'
              variant='link'
              icon={<ExternalLinkAltIcon />}
              iconPosition='right'
              href={`https://console.cloud.google.com/compute/images`}
              className='pf-v6-u-pl-0'
            >
              GCP console
            </Button>{' '}
            or by running the following command:
            <ClipboardCopy
              isReadOnly
              hoverTip='Copy'
              clickTip='Copied'
              variant={ClipboardCopyVariant.expansion}
            >
              {createInstance}
            </ClipboardCopy>
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
