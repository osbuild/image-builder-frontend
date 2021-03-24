import React from 'react';
import PropTypes from 'prop-types';

import { Flex, Spinner } from '@patternfly/react-core';
import { CheckCircleIcon, PendingIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

import './ImageBuildStatus.scss';

const ImageBuildStatus = (props) => {
    const messages = {
        success: [
            {
                icon: <CheckCircleIcon className="success" />,
                text: 'Ready'
            }
        ],
        failure: [
            {
                icon: <ExclamationCircleIcon className="error" />,
                text: 'Image build failed'
            }
        ],
        pending: [
            {
                icon: <PendingIcon />,
                text: 'Image build, Upload, Cloud registration pending'
            }
        ],
        // Keep "running" for backward compatibility
        running: [
            {
                icon: <Spinner size="md" />,
                text: 'Image build in progress'
            },
            {
                icon: <PendingIcon />,
                text: 'Upload, Cloud registration pending'
            }
        ],
        building: [
            {
                icon: <Spinner size="md" />,
                text: 'Image build in progress'
            },
            {
                icon: <PendingIcon />,
                text: 'Upload, Cloud registration pending'
            }
        ],
        uploading: [
            {
                icon: <CheckCircleIcon />,
                text: 'Image build finished'
            },
            {
                icon: <Spinner size="md" />,
                text: 'Image upload in progress'
            },
            {
                icon: <PendingIcon />,
                text: 'Cloud registration pending'
            }
        ],
        registering: [
            {
                icon: <CheckCircleIcon />,
                text: 'Image build finished'
            },
            {
                icon: <CheckCircleIcon />,
                text: 'Image upload finished'
            },
            {
                icon: <Spinner size="md" />,
                text: 'Cloud registration in progress'
            }
        ]
    };
    return (
        <React.Fragment>
            {messages[props.status] &&
                messages[props.status].map((message, key) => (
                    <Flex key={ key } className="pf-u-align-items-baseline pf-m-nowrap">
                        <div>{message.icon}</div>
                        <small>{message.text}</small>
                    </Flex>
                ))
            }
        </React.Fragment>
    );
};

ImageBuildStatus.propTypes = {
    status: PropTypes.string,
};

export default ImageBuildStatus;
