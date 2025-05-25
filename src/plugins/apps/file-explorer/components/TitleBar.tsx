
import React from 'react';
import { Folder, LogOut, Github } from 'lucide-react';
import { User } from '../types/fileSystem';

interface TitleBarProps {
  isAuthenticated: boolean;
  user: User | null;
  handleGithubAuth: () => void;
  handleLogout: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ 
  isAuthenticated, 
  user, 
  handleGithubAuth, 
  handleLogout 
}) => {
  return (
    <div className="h-8 bg-gray-900 text-white flex items-center justify-between px-4 text-sm">
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4" />
        <span className="font-medium">File Explorer</span>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <img 
              src={user?.avatar_url} 
              alt="Avatar" 
              className="w-5 h-5 rounded-full border border-gray-600"
            />
            <span className="text-xs font-medium">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGithubAuth}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
          >
            <Github className="w-3 h-3" />
            Sign in with GitHub
          </button>
        )}
      </div>
    </div>
  );
};

export default TitleBar;
