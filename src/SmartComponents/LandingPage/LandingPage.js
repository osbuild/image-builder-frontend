import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';

import ImagesTable from '../ImagesTable/ImagesTable';

class LandingPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Images' />
                </PageHeader>
                <section className="pf-l-page__main-section pf-c-page__main-section">
                    <ImagesTable />
                </section>
            </React.Fragment>
        );
    }
}

export default withRouter(LandingPage);
