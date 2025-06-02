import { Folder } from "lucide-react";
import React from "react";

import { User } from "../types/fileSystem";

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
  handleLogout,
}) => {
  return (
    <div className="h-8 bg-gray-900 text-white flex items-center justify-between px-4 text-sm">
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4" />
        <span className="font-medium">File Explorer</span>
      </div>
      {/* Removed login panel - we now auto-authenticate */}
    </div>
  );
};

export default TitleBar;
