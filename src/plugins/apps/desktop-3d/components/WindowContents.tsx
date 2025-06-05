
import React from 'react';

export const getWindowContent = (appId: string): React.ReactNode => {
  switch (appId) {
    case 'text-editor':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Text Editor</h3>
          <textarea 
            className="w-full h-40 p-2 border rounded resize-none"
            placeholder="Start typing..."
            defaultValue="Welcome to the 3D Desktop Environment!"
          />
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Save
            </button>
            <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
              Open
            </button>
          </div>
        </div>
      );

    case 'calculator':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Calculator</h3>
          <div className="bg-gray-100 p-4 rounded">
            <div className="text-right text-2xl mb-4 p-2 bg-white rounded">0</div>
            <div className="grid grid-cols-4 gap-2">
              {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
                <button key={btn} className="p-2 bg-gray-300 rounded hover:bg-gray-400">
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">System Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>3D Effects</span>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>Transparency</span>
              <input type="range" min="0" max="100" defaultValue="80" />
            </div>
            <div className="flex items-center justify-between">
              <span>Performance Mode</span>
              <select className="border rounded px-2 py-1">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Image Gallery</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded" />
            ))}
          </div>
          <p className="text-sm text-gray-600">No images to display</p>
        </div>
      );

    case 'terminal':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Terminal</h3>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-40 overflow-y-auto">
            <div>$ Welcome to 3D Desktop Terminal</div>
            <div>$ System: CSS3D Renderer v1.0</div>
            <div>$ Performance: 60fps optimized</div>
            <div>$ Type 'help' for commands</div>
            <div className="flex">
              <span>$ </span>
              <input 
                type="text" 
                className="bg-transparent outline-none flex-1 text-green-400"
                placeholder="Enter command..."
              />
            </div>
          </div>
        </div>
      );

    case 'music':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Music Player</h3>
          <div className="text-center space-y-3">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-violet-500 rounded-lg mx-auto" />
            <div>
              <div className="font-medium">3D Desktop Ambient</div>
              <div className="text-sm text-gray-600">Virtual Artist</div>
            </div>
            <div className="flex justify-center space-x-2">
              <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">⏮</button>
              <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">▶</button>
              <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">⏭</button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{appId}</h3>
          <p>Application content goes here...</p>
        </div>
      );
  }
};
