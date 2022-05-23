import React from 'react';
import PropTypes from 'prop-types';

const Target = (props) => {
  const targetOptions = {
    aws: 'Amazon Web Services',
    azure: 'Microsoft Azure',
    gcp: 'Google Cloud Platform',
    vsphere: 'VMWare',
    'guest-image': 'Virtualization - Guest image',
    'image-installer': 'Bare metal - Installer',
  };

  let target;
  if (props.uploadType === 'aws.s3') {
    target = targetOptions[props.imageType];
  } else {
    target = targetOptions[props.uploadType];
  }

  return <>{target}</>;
};

Target.propTypes = {
  uploadType: PropTypes.string,
  imageType: PropTypes.string,
};

export default Target;
