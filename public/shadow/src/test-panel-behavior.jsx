// Test file for panel behavior verification
import React from 'react';

function TestComponent() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        Panel Behavior Test
      </h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Counter: {count}</h2>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            background: '#007acc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(0)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      <div style={{ color: '#666', fontSize: '14px' }}>
        <p><strong>Test Instructions:</strong></p>
        <ol>
          <li>Click "Run Preview" to see this component</li>
          <li>Terminal/output panel should hide automatically when preview is active</li>
          <li>Switch back to editor tab - terminal should reappear if it was visible before</li>
          <li>Try toggling terminal manually in preview mode</li>
        </ol>
      </div>
    </div>
  );
}

// Render the component
const container = document.getElementById('app');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(TestComponent));
