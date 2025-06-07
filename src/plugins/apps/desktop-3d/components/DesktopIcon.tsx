import { LucideIcon } from 'lucide-react';
import React from 'react';

interface DesktopIconProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
  icon: Icon,
  label,
  onClick,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center w-20 h-20 cursor-pointer group hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg group-hover:bg-white/30 transition-all duration-200">
        <Icon size={24} className="text-foreground drop-shadow-sm" />
      </div>
      <span className="text-xs text-foreground mt-1 drop-shadow-sm text-center">
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;
