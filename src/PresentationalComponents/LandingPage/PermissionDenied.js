import React from 'react';

import { InfoCircleIcon } from '@patternfly/react-icons';
import { Button, EmptyState, EmptyStateVariant, EmptyStateIcon, EmptyStateBody, Title } from '@patternfly/react-core';

const PermissionDenied = () => {
    return (
        <EmptyState variant={ EmptyStateVariant.large } data-testid="empty-state-denied">
            <EmptyStateIcon icon={ InfoCircleIcon } />
            <Title headingLevel="h4" size="lg">
            Image Builder is not quite ready
            </Title>
            <EmptyStateBody>
            Image Builder is in early development and not ready for use yet.
            If you&apos;re interested in trying it out once it reaches beta,
            fill out your contact information in the sign up form, and we&apos;ll be in touch once it&apos;s ready.
            </EmptyStateBody>
            <Button id="beta-signup-button" variant="primary">Sign up</Button>
        </EmptyState>
    );
};

export default PermissionDenied;
