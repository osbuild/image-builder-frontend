import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const ImageLink = (props) => {
    const uploadStatus = props.imageStatus ? props.imageStatus.upload_status : undefined;
    if (uploadStatus) {
        let url = '';
        if (uploadStatus.type === 'gcp') {
            url = 'https://console.cloud.google.com/compute/imagesDetail/projects/' +
                uploadStatus.options.project_id +
                '/global/images/' +
                uploadStatus.options.image_name;
        }

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

    return null;
};

ImageLink.propTypes = {
    imageStatus: PropTypes.object,
};

export default ImageLink;
