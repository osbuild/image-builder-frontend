import React from 'react';
import PropTypes from 'prop-types';

import { Label } from '@patternfly/react-core';

const Release = (props) => {
    const releaseOptions = {
        'rhel-84': 'RHEL 8',
        'centos-8': 'CentOS Stream 8'
    };
    const release = releaseOptions[props.release] ? releaseOptions[props.release] : props.release;
    return <Label color='blue'>{release}</Label>;
};

Release.propTypes = {
    release: PropTypes.string,
};

export default Release;
