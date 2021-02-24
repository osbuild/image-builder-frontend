import React from 'react';
import PropTypes from 'prop-types';

import {
    Alert,
    Text, TextVariants, TextContent, TextList, TextListVariants, TextListItem, TextListItemVariants,
    Title
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import './WizardStepReview.scss';

const WizardStepReview = (props) => {
    const releaseLabels = {
        'rhel-8': 'Red Hat Enterprise Linux (RHEL) 8.3',
        'centos-8': 'CentOS Stream 8'
    };

    const awsReview = (
        <>
            <Text id="destination-header">Amazon Web Services</Text>
            <TextList component={ TextListVariants.dl } data-testid='review-image-upload-aws'>
                <TextListItem component={ TextListItemVariants.dt }>Account ID</TextListItem>
                {props.uploadAWSErrors['aws-account-id'] ? (
                    <TextListItem component={ TextListItemVariants.dd }>
                        <ExclamationCircleIcon className="error" /> { props.uploadAWSErrors['aws-account-id'].value }
                    </TextListItem>
                ) : (
                    <TextListItem component={ TextListItemVariants.dd }>{props.uploadAWS.options.share_with_accounts[0]}</TextListItem>
                )}
            </TextList>
        </>
    );

    return (
        <>
            { (Object.keys(props.uploadAWSErrors).length > 0 ||
               Object.keys(props.subscriptionErrors).length > 0) &&
              <Alert variant="danger" className="pf-u-mb-xl" isInline title="Required information is missing" /> }
            <Title headingLevel="h2" size="xl">Review</Title>
            <TextContent>
                <Text component={ TextVariants.small }>
                    Review the information and click Create image
                    to create the image using the following criteria.
                </Text>
                <Text component={ TextVariants.h3 }>Image output</Text>
                <TextList component={ TextListVariants.dl } data-testid='review-image-output'>
                    <TextListItem component={ TextListItemVariants.dt }>Release</TextListItem>
                    <TextListItem component={ TextListItemVariants.dd }>{releaseLabels[props.release]}</TextListItem>
                </TextList>
                <Text component={ TextVariants.h3 }>Target environment</Text>
                {props.uploadDestinations.aws && awsReview }
                <Text component={ TextVariants.h3 }>Registration</Text>
                <TextList component={ TextListVariants.dl } data-testid='review-image-registration'>
                    <TextListItem component={ TextListItemVariants.dt }>Subscription</TextListItem>
                    { props.subscribeNow ? (
                        <TextListItem component={ TextListItemVariants.dd }>Register the system on first boot</TextListItem>
                    ) : (
                        <TextListItem component={ TextListItemVariants.dd }>Register the system later</TextListItem>
                    )}
                    <TextListItem component={ TextListItemVariants.dt }>Activation key</TextListItem>
                    { props.subscriptionErrors['subscription-activation'] ? (
                        <TextListItem component={ TextListItemVariants.dd }>
                            <ExclamationCircleIcon className="error" /> { props.subscriptionErrors['subscription-activation'].value }
                        </TextListItem>
                    ) : (
                        <TextListItem component={ TextListItemVariants.dd } type="password">
                            {'*'.repeat(props.subscription['activation-key'].length)}
                        </TextListItem>
                    )}
                </TextList>
            </TextContent>
        </>
    );
};

WizardStepReview.propTypes = {
    release: PropTypes.string,
    uploadAWS: PropTypes.object,
    uploadDestinations: PropTypes.object,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    uploadAWSErrors: PropTypes.object,
    subscriptionErrors: PropTypes.object,
};

export default WizardStepReview;
