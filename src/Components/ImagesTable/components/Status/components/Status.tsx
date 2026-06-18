import React from 'react';

import { Flex } from '@patternfly/react-core';

type StatusPropTypes = {
  icon: JSX.Element;
  text: JSX.Element;
};

const Status = ({ icon, text }: StatusPropTypes) => {
  return (
    <Flex className='pf-v6-u-align-items-baseline pf-m-nowrap'>
      <div className='pf-v6-u-mr-sm'>{icon}</div>
      <p>{text}</p>
    </Flex>
  );
};

export default Status;
