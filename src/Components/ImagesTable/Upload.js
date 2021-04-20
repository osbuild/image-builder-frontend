import React from 'react';
import PropTypes from 'prop-types';

const Upload = (props) => {
    const uploadOptions = {
        aws: 'Amazon Web Services',
        azure: 'Microsoft Azure',
        gcp: 'Google Cloud Platform',
    };
    return <>{ uploadOptions[props.uploadType] ? uploadOptions[props.uploadType] : props.uploadType }</>;
};

Upload.propTypes = {
    uploadType: PropTypes.string,
};

export default Upload;
