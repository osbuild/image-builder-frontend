import React from 'react';

import { Alert } from '@patternfly/react-core';
import { useVariant } from '@unleash/proxy-client-react';

const getValidAlertVariant = (variant: unknown): string => {
  if (typeof variant === 'string') {
    if (variant === 'success') return 'success';
    if (variant === 'info') return 'info';
    if (variant === 'warning') return 'warning';
    if (variant === 'danger') return 'danger';
    if (variant === 'custom') return 'custom';
  }
  return 'danger';
};

const ServiceUnavailableAlert = () => {
  const variant = useVariant('image-builder.service-unavailable');
  const payload = variant.payload
    ? JSON.parse(variant.payload.value)
    : undefined;

  const title =
    payload?.title ||
    'The Image Builder service is currently unavailable. Please check back later.';
  const body = payload?.body || '';
  const alertVariant = getValidAlertVariant(payload?.variant) || 'danger';

  return (
    <Alert
      title={title}
      variant={
        alertVariant as 'success' | 'info' | 'warning' | 'danger' | 'custom'
      }
    >
      {body}
    </Alert>
  );
};

export default ServiceUnavailableAlert;
