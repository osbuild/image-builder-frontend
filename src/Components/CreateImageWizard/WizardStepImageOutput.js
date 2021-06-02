import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions } from '../../store/actions';

import { Form, FormGroup, FormSelect, FormSelectOption, Tile, Title } from '@patternfly/react-core';

import './WizardStepImageOutput.scss';

class WizardStepImageOutput extends Component {
    constructor(props) {
        super(props);

        this.setDistro = this.setDistro.bind(this);
        this.toggleUploadDestination = this.toggleUploadDestination.bind(this);
    }

    setDistro(distro) {
        this.props.setRelease({ arch: 'x86_64', distro });
    }

    toggleUploadDestination(provider) {
        this.props.setUploadDestinations({
            ...this.props.uploadDestinations,
            [provider]: !this.props.uploadDestinations[provider]
        });
    }

    render() {
        const releaseOptions = [
            { value: 'rhel-8', label: 'Red Hat Enterprise Linux (RHEL) 8.3' },
            { value: 'centos-8', label: 'CentOS Stream 8' },
        ];

        return (
            <>
                <Form>
                    <Title headingLevel="h2" size="xl">Image output</Title>
                    <FormGroup isRequired label="Release" fieldId="release-select">
                        <FormSelect value={ this.props.release.distro } onChange={ value => this.setDistro(value) } isRequired
                            aria-label="Select release input" id="release-select" data-testid="release-select">
                            { releaseOptions.map(option => <FormSelectOption key={ option.value } value={ option.value } label={ option.label } />) }
                        </FormSelect>
                    </FormGroup>
                    <FormGroup isRequired label="Select target environment" data-testid="target-select">
                        <div className="tiles">
                            <Tile
                                className="tile pf-u-mr-sm"
                                data-testid="upload-aws"
                                title="Amazon Web Services"
                                icon={ <img
                                    className='provider-icon'
                                    src={ '/apps/frontend-assets/partners-icons/aws.svg' } /> }
                                onClick={ () => this.toggleUploadDestination('aws') }
                                isSelected={ this.props.uploadDestinations.aws }
                                isStacked
                                isDisplayLarge />
                            <Tile
                                className="tile pf-u-mr-sm"
                                data-testid="upload-google"
                                title="Google Cloud Platform"
                                icon={ <img
                                    className='provider-icon'
                                    src={ '/apps/frontend-assets/partners-icons/google-cloud-short.svg' } /> }
                                onClick={ () => this.toggleUploadDestination('google') }
                                isSelected={ this.props.uploadDestinations.google }
                                isStacked
                                isDisplayLarge />
                            <Tile
                                className="tile"
                                data-testid="upload-azure"
                                title="Microsoft Azure"
                                icon={ <img
                                    className='provider-icon'
                                    src={ '/apps/frontend-assets/partners-icons/microsoft-azure-short.svg' } /> }
                                onClick={ () => this.toggleUploadDestination('azure') }
                                isSelected={ this.props.uploadDestinations.azure }
                                isStacked
                                isDisplayLarge />
                        </div>
                    </FormGroup>
                </Form>
            </>
        );
    }
};

function mapStateToProps(state) {
    return {
        release: state.pendingCompose.release,
        uploadDestinations: state.pendingCompose.uploadDestinations,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setRelease: i => dispatch(actions.setRelease(i)),
        setUploadDestinations: d => dispatch(actions.setUploadDestinations(d)),
    };
}

WizardStepImageOutput.propTypes = {
    setRelease: PropTypes.func,
    setUploadDestinations: PropTypes.func,
    release: PropTypes.object,
    uploadDestinations: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(WizardStepImageOutput);
