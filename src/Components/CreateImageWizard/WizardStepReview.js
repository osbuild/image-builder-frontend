import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    Alert,
    Text, TextVariants, TextContent, TextList, TextListVariants, TextListItem, TextListItemVariants,
    Title
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import './WizardStepReview.scss';

class WizardStepReview extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const releaseLabels = {
            'rhel-8': 'Red Hat Enterprise Linux (RHEL) 8',
            'centos-8': 'CentOS Stream 8'
        };

        const awsReview = (
            <>
                <Text id="destination-header">Amazon Web Services</Text>
                <TextList component={ TextListVariants.dl } data-testid='review-image-upload-aws'>
                    <TextListItem component={ TextListItemVariants.dt }>Account ID</TextListItem>
                    {this.props.uploadAWSErrors['aws-account-id'] ? (
                        <TextListItem component={ TextListItemVariants.dd }>
                            <ExclamationCircleIcon className="error" /> { this.props.uploadAWSErrors['aws-account-id'].value }
                        </TextListItem>
                    ) : (
                        <TextListItem component={ TextListItemVariants.dd }>{this.props.uploadAWS.shareWithAccounts[0]}</TextListItem>
                    )}
                </TextList>
            </>
        );

        const googleReview = (
            <>
                <Text id="destination-header">Google Cloud Platform</Text>
                <TextList component={ TextListVariants.dl } data-testid='review-image-upload-google'>
                    {this.props.uploadGoogle.accountType === 'googleAccount' && (
                        <>
                            <TextListItem component={ TextListItemVariants.dt }>Google account</TextListItem>
                            <TextListItem component={ TextListItemVariants.dd }>{this.props.uploadGoogle.shareWithAccounts[0] ?
                                this.props.uploadGoogle.shareWithAccounts[0].user || '' :
                                ''}
                            </TextListItem>
                        </>
                    )}
                    {this.props.uploadGoogle.accountType === 'serviceAccount' && (
                        <>
                            <TextListItem component={ TextListItemVariants.dt }>Service account</TextListItem>
                            <TextListItem component={ TextListItemVariants.dd }>{this.props.uploadGoogle.shareWithAccounts[0] ?
                                this.props.uploadGoogle.shareWithAccounts[0].serviceAccount || '' :
                                ''}
                            </TextListItem>
                        </>
                    )}
                    {this.props.uploadGoogle.accountType === 'googleGroup' && (
                        <>
                            <TextListItem component={ TextListItemVariants.dt }>Google group</TextListItem>
                            <TextListItem component={ TextListItemVariants.dd }>{this.props.uploadGoogle.shareWithAccounts[0] ?
                                this.props.uploadGoogle.shareWithAccounts[0].group || '' :
                                ''}
                            </TextListItem>
                        </>
                    )}
                    {this.props.uploadGoogle.accountType === 'domain' && (
                        <>
                            <TextListItem component={ TextListItemVariants.dt }>Domain</TextListItem>
                            <TextListItem component={ TextListItemVariants.dd }>{this.props.uploadGoogle.shareWithAccounts[0] ?
                                this.props.uploadGoogle.shareWithAccounts[0].domain || '' :
                                ''}
                            </TextListItem>
                        </>
                    )}
                </TextList>
            </>
        );

        let subscriptionReview = <TextListItem component={ TextListItemVariants.dd }>Register the system later</TextListItem>;
        if (this.props.subscribeNow) {
            subscriptionReview = (<>
                <TextListItem component={ TextListItemVariants.dd }>Register the system on first boot</TextListItem>
                <TextListItem component={ TextListItemVariants.dt }>Activation key</TextListItem>
                { !this.props.isValidSubscription || !this.props.subscription.activationKey ? (
                    <TextListItem component={ TextListItemVariants.dd }>
                        <ExclamationCircleIcon className="error" /> { 'A value is required' }
                    </TextListItem>
                ) : (
                    <TextListItem component={ TextListItemVariants.dd } type="password">
                        {'*'.repeat(this.props.subscription.activationKey.length)}
                    </TextListItem>
                )}
            </>);
        }

        return (
            <>
                { (Object.keys(this.props.uploadAWSErrors).length > 0 ||
               !this.props.isValidSubscription) &&
              <Alert variant="danger" className="pf-u-mb-xl" isInline title="Required information is missing" /> }
                <Title headingLevel="h2" size="xl">Review</Title>
                <TextContent>
                    <Text component={ TextVariants.small }>
                    Review the information and click the Create button
                    to create your image using the following criteria.
                    </Text>
                    <Text component={ TextVariants.h3 }>Image output</Text>
                    <TextList component={ TextListVariants.dl } data-testid='review-image-output'>
                        <TextListItem component={ TextListItemVariants.dt }>Release</TextListItem>
                        <TextListItem component={ TextListItemVariants.dd }>{releaseLabels[this.props.release]}</TextListItem>
                    </TextList>
                    <Text component={ TextVariants.h3 }>Target environment</Text>
                    {this.props.uploadDestinations.aws && awsReview }
                    {this.props.uploadDestinations.google && googleReview }
                    <Text component={ TextVariants.h3 }>Registration</Text>
                    <TextList component={ TextListVariants.dl } data-testid='review-image-registration'>
                        <TextListItem component={ TextListItemVariants.dt }>Subscription</TextListItem>
                        { subscriptionReview }
                    </TextList>
                </TextContent>
            </>
        );
    }
};

function mapStateToProps(state) {
    return {
        uploadDestinations: state.pendingCompose.uploadDestinations,
        uploadAWS: state.pendingCompose.uploadAWS,
        uploadAzure: state.pendingCompose.uploadAzure,
        uploadGoogle: state.pendingCompose.uploadGoogle,
        subscribeNow: state.pendingCompose.subscribeNow,
        subscription: state.pendingCompose.subscription,
    };
}

WizardStepReview.propTypes = {
    release: PropTypes.string,
    uploadAWS: PropTypes.object,
    uploadGoogle: PropTypes.object,
    uploadDestinations: PropTypes.object,
    uploadAzure: PropTypes.object,
    subscription: PropTypes.object,
    subscribeNow: PropTypes.bool,
    uploadAWSErrors: PropTypes.object,
    isValidSubscription: PropTypes.bool,
};

export default connect(mapStateToProps, null)(WizardStepReview);
