
import React from 'react';
import { Upload, FileText } from 'lucide-react';

interface DropZoneProps {
  onDrop: (e: React.DragEvent) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, isProcessing }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center justify-center h-96 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white mb-2">
          Drop Your Python File
        </h2>
        <p className="text-xl text-blue-200 max-w-2xl mx-auto">
          Convert Python functions to TypeScript with automatic OpenAPI generation and type safety
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 transform hover:scale-105 ${
          isProcessing
            ? 'border-green-400 bg-green-500/10 shadow-lg shadow-green-500/20'
            : 'border-blue-400 bg-blue-500/10 hover:border-blue-300 hover:bg-blue-500/20 shadow-lg shadow-blue-500/20'
        } backdrop-blur-md max-w-2xl mx-auto`}
        onDrop={onDrop}
        onDragOver={handleDragOver}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-green-300 border-t-green-500 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <p className="text-xl text-green-300 font-semibold">Processing...</p>
              <p className="text-green-200">Analyzing Python code and generating TypeScript</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
              <FileText className="absolute -bottom-2 -right-2 h-8 w-8 text-green-400" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl text-white font-semibold">
                Drop Python files here
              </p>
              <p className="text-blue-200">
                Supports .py files with type annotations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-green-400 font-mono text-sm">✓ Functions</div>
                <div className="text-white/70 text-xs">Auto-detect & convert</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-400 font-mono text-sm">✓ Types</div>
                <div className="text-white/70 text-xs">Preserve annotations</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-purple-400 font-mono text-sm">✓ API</div>
                <div className="text-white/70 text-xs">Generate OpenAPI</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;
