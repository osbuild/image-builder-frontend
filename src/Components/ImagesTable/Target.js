import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectComposeById } from '../../store/composesSlice';

const Target = ({ composeId }) => {
  const compose = useSelector((state) => selectComposeById(state, composeId));

  const targetOptions = {
    aws: 'Amazon Web Services',
    azure: 'Microsoft Azure',
    gcp: 'Google Cloud Platform',
    vsphere: 'VMWare',
    'guest-image': 'Virtualization - Guest image',
    'image-installer': 'Bare metal - Installer',
  };

  let target;
  if (compose.uploadType === 'aws.s3') {
    target = targetOptions[compose.imageType];
  } else if (compose.uploadType === 'aws') {
    target =
      targetOptions[compose.uploadType] +
      ` (${compose.clones.length !== 0 ? compose.clones.length + 1 : 1})`;
  } else {
    target = targetOptions[compose.uploadType];
  }

  return <>{target}</>;
};

Target.propTypes = {
  composeId: PropTypes.string,
};

export default Target;
