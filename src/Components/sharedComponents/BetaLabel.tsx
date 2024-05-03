import React from 'react';

import { Label } from '@patternfly/react-core';

import './BetaLabel.scss';

const BetaLabel = () => {
  return (
    <Label className="beta-label">
      <b>Preview</b>
    </Label>
  );
};

export default BetaLabel;
