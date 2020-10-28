import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import { Main } from '@redhat-cloud-services/frontend-components';
import './App.scss';

class App extends Component {
    constructor() {
        super();

        this.state = {};
    }

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('image-builder');
        this.appNav = insights.chrome.on('APP_NAVIGATION', event => this.props.history.push(`/${event.navId}`));
        insights.chrome.auth.getUser().then(data => {
            this.setState({ identity: data.identity });
        });
    }

    componentWillUnmount () {
        this.appNav();
    }

    render () {
        return (
            <Main style={ { marginLeft: 0, padding: 0 } }>
                <Routes childProps={ this.props } />
            </Main>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter (connect()(App));
