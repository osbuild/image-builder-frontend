import React from 'react';

import {
  Button,
  Divider,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { RegionsPopover } from './RegionsPopover';

import { selectImageById } from '../../store/composesSlice';
import { resolveRelPath } from '../../Utilities/path';
import BetaLabel from '../sharedComponents/BetaLabel';

const ImageLinkDirect = ({ imageId, isExpired, isInClonesTable }) => {
  const navigate = useNavigate();

  const image = useSelector((state) => selectImageById(state, imageId));
  const uploadStatus = image.uploadStatus;

  const fileExtensions = {
    vsphere: '.vmdk',
    'guest-image': '.qcow2',
    'image-installer': '.iso',
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
    const createdInPreview = image?.uploadOptions?.source_id;
    const url =
      'https://portal.azure.com/#@' +
      image.uploadOptions.tenant_id +
      '/resource/subscriptions/' +
      image.uploadOptions.subscription_id +
      '/resourceGroups/' +
      image.uploadOptions.resource_group +
      '/providers/Microsoft.Compute/images/' +
      uploadStatus.options.image_name;
    return createdInPreview ? (
      <Popover
        /* popovers aren't rendered inside of the main page section, make sure our prefixed css still
         * applies */
        className="imageBuilder"
        aria-label="Launch instance"
        headerContent={<div>Launch instance</div>}
        bodyContent={
          <>
            <>
              <p>
                This image was created using features only available in Preview.
              </p>
              <Divider className="pf-u-mt-sm pf-u-mb-sm" />
              <Button
                isInline
                component="a"
                variant="link"
                href="/preview/insights/image-builder/landing"
              >
                <BetaLabel />
                Launch from Preview
              </Button>
            </>
          </>
        }
      >
        <Button variant="link" isInline>
          Launch
        </Button>
      </Popover>
    ) : (
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
        aria-label="Popover with google cloud platform image details"
        maxWidth="30rem"
        headerContent={'GCP image details'}
        bodyContent={
          <TextContent>
            <Text component={TextVariants.p}>
              To use an Image Builder created Google Cloud Platform (GCP) image
              in your project, specify the project ID and image name in your
              templates and configurations.
            </Text>
            <Text>
              <strong>Project ID</strong>
              <br />
              {uploadStatus.options.project_id}
            </Text>
            <Text>
              <strong>Image Name</strong>
              <br />
              {uploadStatus.options.image_name}
            </Text>
            <Text>
              <strong>Shared with</strong>
              <br />
              {/* the account the image is shared with is stored in the form type:account so this extracts the account */}
              {image.uploadOptions.share_with_accounts[0].split(':')[1]}
            </Text>
          </TextContent>
        }
      >
        <Button component="a" target="_blank" variant="link" isInline>
          Image details
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
