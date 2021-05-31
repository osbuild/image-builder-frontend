import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const ImageLink = (props) => {
    const uploadStatus = props.imageStatus ? props.imageStatus.upload_status : undefined;
    if (uploadStatus) {
        if (uploadStatus.type === 'aws') {
            const url = 'https://console.aws.amazon.com/ec2/v2/home?region=' +
                    uploadStatus.options.region +
                    '#LaunchInstanceWizard:ami=' +
                    uploadStatus.options.ami;
            return (
                <Button
                    component="a"
                    target="_blank"
                    variant="link"
                    icon={ <ExternalLinkAltIcon /> }
                    iconPosition="right"
                    isInline
                    href={ url }>
                        Launch instance
                </Button>
            );
        } else if (uploadStatus.type === 'azure') {
            const url = 'https://portal.azure.com/#@' + props.uploadOptions.tenant_id +
            '/resource/subscriptions/' + props.uploadOptions.subscription_id +
            '/resourceGroups/' + props.uploadOptions.resource_group +
            '/providers/Microsoft.Compute/images/' + uploadStatus.options.image_name;
            return (
                <Button
                    component="a"
                    target="_blank"
                    variant="link"
                    icon={ <ExternalLinkAltIcon /> }
                    iconPosition="right"
                    isInline
                    href={ url }>
                        View uploaded image
                </Button>
            );
        }
    }

    return null;
};

ImageLink.propTypes = {
    imageStatus: PropTypes.object,
    uploadOptions: PropTypes.object,
};

export default ImageLink;
