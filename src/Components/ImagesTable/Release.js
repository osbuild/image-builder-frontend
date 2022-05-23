import React from 'react';
import PropTypes from 'prop-types';

import { Label } from '@patternfly/react-core';
import { RHEL_8, RHEL_9 } from '../../constants.js';

const Release = (props) => {
  const releaseOptions = {
    [RHEL_8]: 'RHEL 8',
    [RHEL_9]: 'RHEL 9',
    'centos-8': 'CentOS Stream 8',
    'centos-9': 'CentOS Stream 9',
  };
  const release = releaseOptions[props.release]
    ? releaseOptions[props.release]
    : props.release;
  return <Label color="blue">{release}</Label>;
};

Release.propTypes = {
  release: PropTypes.string,
};

export default Release;
