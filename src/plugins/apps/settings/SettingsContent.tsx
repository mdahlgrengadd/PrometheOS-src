
import React from 'react';

const SettingsContent: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">System Settings</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 p-3 rounded">
          <h3 className="font-medium">Appearance</h3>
          <div className="flex items-center mt-2">
            <span className="mr-2">Theme:</span>
            <select className="border border-gray-300 rounded px-2 py-1">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
        </div>
        
        <div className="border border-gray-200 p-3 rounded">
          <h3 className="font-medium">Display</h3>
          <div className="mt-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Show desktop icons
            </label>
          </div>
        </div>
        
        <div className="border border-gray-200 p-3 rounded">
          <h3 className="font-medium">About</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>Desktop System</p>
            <p>Version: 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
