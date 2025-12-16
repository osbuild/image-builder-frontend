import React from 'react';

import { Alert } from '@patternfly/react-core';
import { useVariant } from '@unleash/proxy-client-react';

const ServiceUnavailableAlert = () => {
  const variant = useVariant('image-builder.service-unavailable');
  const payload = variant.payload
    ? JSON.parse(variant.payload.value)
    : undefined;

  const title =
    payload?.title ||
    'The Image Builder service is currently unavailable. Please check back later.';
  const body = payload?.body || '';

  return (
    <Alert title={title} variant='danger'>
      {body}
      {body && (
        <>
          <br />
          We&apos;ve identified the issue and are working on a fix.
        </>
      )}
    </Alert>
  );
};

export default ServiceUnavailableAlert;
