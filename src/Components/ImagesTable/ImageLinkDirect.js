import React from 'react';

import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RegionsPopover } from './RegionsPopover';

import { selectImageById } from '../../store/composesSlice';
import { resolveRelPath } from '../../Utilities/path';

const launchInstanceCommand = (uploadStatus) => {
  return `gcloud compute instances create ${uploadStatus.options.image_name}-instance --image-project ${uploadStatus.options.project_id} --image ${uploadStatus.options.image_name}`;
};

const saveCopyCommand = (uploadStatus) => {
  return `gcloud compute images create ${uploadStatus.options.image_name}-copy --source-image-project ${uploadStatus.options.project_id} --source-image ${uploadStatus.options.image_name}`;
};

const ImageLinkDirect = ({ imageId, isExpired, isInClonesTable }) => {
  const navigate = useNavigate();

  const image = useSelector((state) => selectImageById(state, imageId));
  if (!image) {
    return null;
  }
  const uploadStatus = image.uploadStatus;

  const fileExtensions = {
    vsphere: '.vmdk',
    'vsphere-ova': '.ova',
    'guest-image': '.qcow2',
    'image-installer': '.iso',
    wsl: '.tar.gz',
  };

  if (uploadStatus.type === 'aws') {
    const url =
      'https://console.aws.amazon.com/ec2/v2/home?region=' +
      uploadStatus.options.region +
      '#LaunchInstanceWizard:ami=' +
      uploadStatus.options.ami;
    if (isInClonesTable) {
      return (
        <Button
          component="a"
          target="_blank"
          variant="link"
          isInline
          href={url}
        >
          Launch
        </Button>
      );
    } else {
      return <RegionsPopover composeId={image.id} />;
    }
  } else if (uploadStatus.type === 'azure') {
    const url =
      'https://portal.azure.com/#@' +
      image.uploadOptions.tenant_id +
      '/resource/subscriptions/' +
      image.uploadOptions.subscription_id +
      '/resourceGroups/' +
      image.uploadOptions.resource_group +
      '/providers/Microsoft.Compute/images/' +
      uploadStatus.options.image_name;
    return (
      <Button
        component="a"
        target="_blank"
        variant="link"
        icon={<ExternalLinkAltIcon />}
        iconPosition="right"
        isInline
        href={url}
      >
        View uploaded image
      </Button>
    );
  } else if (uploadStatus.type === 'gcp') {
    return (
      <Popover
        aria-label="Popover with google cloud platform image commands"
        maxWidth="30rem"
        headerContent={'Image commands'}
        bodyContent={
          <TextContent>
            <br />
            <Text>
              <strong>Launch an instance</strong>
            </Text>
            <ClipboardCopy
              hoverTip="Copy"
              clickTip="Copied"
              ouiaId="gcp-launch-instance"
              variant={ClipboardCopyVariant.expansion}
              isReadOnly
              isExpanded
            >
              {launchInstanceCommand(uploadStatus)}
            </ClipboardCopy>
            <br />
            <Text>
              <strong>Save a copy</strong>
            </Text>
            <ClipboardCopy
              hoverTip="Copy"
              clickTip="Copied"
              ouiaId="gcp-save-copy"
              variant={ClipboardCopyVariant.expansion}
              isReadOnly
              isExpanded
            >
              {saveCopyCommand(uploadStatus)}
            </ClipboardCopy>
          </TextContent>
        }
      >
        <Button component="a" target="_blank" variant="link" isInline>
          Image commands
        </Button>
      </Popover>
    );
  } else if (uploadStatus.type === 'aws.s3') {
    if (!isExpired) {
      return (
        <Button
          component="a"
          target="_blank"
          variant="link"
          isInline
          href={uploadStatus.options.url}
        >
          Download ({fileExtensions[image.imageType]})
        </Button>
      );
    } else {
      return (
        <Button
          component="a"
          target="_blank"
          variant="link"
          onClick={() => navigate(resolveRelPath(`imagewizard/${imageId}`))}
          isInline
        >
          Recreate image
        </Button>
      );
    }
  }

  return null;
};

ImageLinkDirect.propTypes = {
  imageId: PropTypes.string,
  isExpired: PropTypes.bool,
  isInClonesTable: PropTypes.bool,
};

export default ImageLinkDirect;
