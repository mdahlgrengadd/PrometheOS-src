
import React from 'react';
import { Code } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Python to TypeScript Converter</h1>
              <p className="text-blue-200 text-sm">Browser-based code conversion with Pyodide</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-white/70 text-sm">
            <span className="px-2 py-1 bg-green-500/20 rounded-full">
              ✓ Pyodide Ready
            </span>
            <span className="px-2 py-1 bg-blue-500/20 rounded-full">
              🚀 Real-time
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
