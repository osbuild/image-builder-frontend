import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';

import { Form, FormGroup, TextInput, Title } from '@patternfly/react-core';

class WizardStepUploadAWS extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Form>
                <Title headingLevel="h2" size="xl">Target Environment - Amazon Web Services</Title>
                <p>
            Your image will be uploaded to a temporary account on Amazon Web Services. <br />
            The image will be shared with the account you provide below. <br />
            Within the next 14 days you will need to copy the shared image to your own account.
            After 14 days it will be unavailable and will have to be regenerated.
                </p>
                <FormGroup isRequired label="AWS account ID" fieldId="aws-account-id"
                    helperTextInvalid={ (this.props.errors['aws-account-id'] && this.props.errors['aws-account-id'].value) || '' }
                    validated={ (this.props.errors['aws-account-id'] && 'error') || 'default' }>
                    <TextInput value={ this.props.uploadAWS.shareWithAccounts || '' }
                        type="text" aria-label="AWS account ID" id="aws-account-id"
                        data-testid="aws-account-id" isRequired
                        onChange={ value => this.props.setUploadAWS({ shareWithAccounts: [ value ]}) } />
                </FormGroup>
            </Form>
        );
    }
};

function mapStateToProps(state) {
    return {
        uploadAWS: state.pendingCompose.uploadAWS,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setUploadAWS: u => dispatch(actions.setUploadAWS(u)),
    };
}

WizardStepUploadAWS.propTypes = {
    setUploadAWS: PropTypes.func,
    uploadAWS: PropTypes.object,
    errors: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardStepUploadAWS);
