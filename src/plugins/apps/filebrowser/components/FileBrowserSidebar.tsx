import { Folder, Github, HardDrive, Network } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Drive } from '@/services/FileSystem';

interface FileBrowserSidebarProps {
  selectedDrive: string;
  onDriveSelect: (driveId: string) => void;
  drives: Drive[];
}

const FileBrowserSidebar: React.FC<FileBrowserSidebarProps> = ({
  selectedDrive,
  onDriveSelect,
  drives,
}) => {
  const getDriveIcon = (driveType: string) => {
    switch (driveType) {
      case "github":
        return <Github className="h-4 w-4 mr-2" />;
      case "network":
        return <Network className="h-4 w-4 mr-2" />;
      default:
        return <HardDrive className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="w-48 border-r p-2 h-full bg-muted/20">
      <h3 className="font-semibold text-sm mb-2 px-2">Drives</h3>
      <div className="space-y-1">
        {drives.map((drive) => (
          <div
            key={drive.id}
            className={cn(
              "flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-muted",
              selectedDrive === drive.id && "bg-muted"
            )}
            onClick={() => onDriveSelect(drive.id)}
          >
            {getDriveIcon(drive.type)}
            <span className="truncate">{drive.name}</span>
            {drive.readOnly && (
              <span className="ml-auto text-xs text-muted-foreground">
                (RO)
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-sm mb-2 px-2">Quick Access</h3>
        <div className="space-y-1">
          <div className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-muted">
            <Folder className="h-4 w-4 mr-2" />
            <span>Documents</span>
          </div>
          <div className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-muted">
            <Folder className="h-4 w-4 mr-2" />
            <span>Pictures</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileBrowserSidebar;
