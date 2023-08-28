import React from 'react';

import { createRoot } from 'react-dom/client';

import ImageBuilder from './AppEntry';

const root = createRoot(document.getElementById('root'));

root.render(<ImageBuilder />);
