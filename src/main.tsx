import './index.css';
import './styles/animations.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { processWindowUrlParams } from './store/windowStore';

// Process any URL parameters for opening windows
processWindowUrlParams();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
