import React from 'react';

import { Label } from '@patternfly/react-core';

import './PreviewLabel.scss';

const PreviewLabel = () => {
  return (
    <Label className="preview-label">
      <b>Preview</b>
    </Label>
  );
};

export default PreviewLabel;
