import React from 'react';

import { cn } from '@/lib/utils';

interface AppIconProps {
  name: string;
  icon: React.ElementType;
  color: string;
  size?: "sm" | "md" | "lg";
  onClick?: (e?: React.MouseEvent) => void;
}

const AppIcon: React.FC<AppIconProps> = ({
  name,
  icon: Icon,
  color,
  size = "md",
  onClick,
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-xl",
    md: "w-14 h-14 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center pointer-events-auto z-50",
        "app-icon"
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95",
          color,
          sizeClasses[size]
        )}
      >
        <Icon
          className="text-white"
          size={size === "sm" ? 18 : size === "md" ? 24 : 28}
        />
      </div>
      <span className="mt-1 text-xs text-center font-medium text-white">
        {name}
      </span>
    </div>
  );
};

export default AppIcon;
