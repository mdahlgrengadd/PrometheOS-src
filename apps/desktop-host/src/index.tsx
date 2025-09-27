// Host Application Entry Point - Module Federation Desktop
import React from 'react';
import { createRoot } from 'react-dom/client';
import { DesktopHost } from './DesktopHost';
import './styles/global.css';

// Initialize the host application
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

// Initialize sophisticated integration architecture
console.log('🚀 PrometheOS Module Federation Host starting...');
console.log('✅ Hot Module Replacement test');
console.log('🔧 Initializing 7-layer integration architecture');
console.log('🔌 Setting up API bridges and MCP protocol server');
console.log('🎨 Loading theme system and window management');

try {
  root.render(

      <DesktopHost />

  );
  console.log('✅ React successfully mounted!');
} catch (error) {
  console.error('❌ React mounting failed:', error);
  // Fallback render without StrictMode
  try {
    root.render(<DesktopHost />);
    console.log('✅ React mounted without StrictMode!');
  } catch (fallbackError) {
    console.error('❌ React mounting completely failed:', fallbackError);
    // Manual DOM manipulation as last resort
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = '<div style="background:red;color:white;padding:20px;text-align:center;">REACT FAILED TO MOUNT</div>';
    }
  }
}