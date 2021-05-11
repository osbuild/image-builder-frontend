import React from 'react';
import ReactDOM from 'react-dom';
import logger from 'redux-logger';
import ImageBuilder from './DevEntry';

ReactDOM.render(<ImageBuilder logger={ logger } />, document.getElementById('root'));
