
import React, { RefObject } from 'react';
import { ChevronRight, Home, RefreshCw, Upload, Plus } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string[];
}

interface ToolbarProps {
  currentPath: string[];
  breadcrumbs: BreadcrumbItem[];
  navigateUp: () => void;
  navigateToPathLevel: (level: number) => void;
  showNewItemDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  isAuthenticated: boolean;
  handleGithubAuth: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  breadcrumbs,
  navigateUp,
  navigateToPathLevel,
  showNewItemDialog,
  fileInputRef,
  isAuthenticated,
  handleGithubAuth
}) => {
  return (
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
      <button
        onClick={navigateUp}
        disabled={currentPath.length <= 1}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Go up"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
      </button>
      
      <button 
        className="p-2 hover:bg-gray-200 rounded transition-colors"
        title="Refresh"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

      <div className="flex-1 mx-4">
        <div className="flex items-center bg-white border border-gray-300 rounded px-3 py-1.5">
          <Home className="w-4 h-4 text-gray-400 mr-2" />
          <button
            onClick={() => navigateToPathLevel(0)}
            className="text-sm hover:text-blue-600 transition-colors"
          >
            This PC
          </button>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
              <button
                onClick={() => navigateToPathLevel(index + 1)}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => isAuthenticated ? showNewItemDialog() : handleGithubAuth()}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors disabled:opacity-50"
          title={!isAuthenticated ? "Sign in to create items" : "Create new item"}
        >
          <Plus className="w-4 h-4" />
          New
        </button>
        
        <button
          onClick={() => isAuthenticated ? fileInputRef.current?.click() : handleGithubAuth()}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title={!isAuthenticated ? "Sign in to upload files" : "Upload files"}
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
