import './index.css';

import { createRoot } from 'react-dom/client';

import { PlayerFullSyncProvider } from '@splicemood/react-music-player';

import App from './App.tsx';

createRoot(document.getElementById("root")!).render(
  <PlayerFullSyncProvider>
    <App />
  </PlayerFullSyncProvider>
);
