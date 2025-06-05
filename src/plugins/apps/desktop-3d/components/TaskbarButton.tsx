import { LucideIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface TaskbarButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  tooltip?: string;
  side?: "left" | "right";
  children?: React.ReactNode; // For popup content
  size?: number;
  className?: string;
  popupOpacity?: number; // 0-100, default 20 (pretty transparent)
}

const TaskbarButton: React.FC<TaskbarButtonProps> = ({
  icon: Icon,
  onClick,
  tooltip,
  side = "left",
  children,
  size = 16,
  className = "",
  popupOpacity = 20,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (children) {
      setShowPopup(!showPopup);
    }
    if (onClick) {
      onClick();
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopup]);

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showPopup]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`p-2 hover:bg-white/10 rounded transition-colors ${
          showPopup ? "bg-white/10" : ""
        } ${className}`}
        title={tooltip}
      >
        <Icon size={size} className="text-white" />
      </button>{" "}
      {children && showPopup && (
        <div
          ref={popupRef}
          className={`fixed bottom-14 z-50 ${
            side === "right" ? "right-4" : "left-4"
          }`}
        >
          <div
            className="backdrop-blur-md rounded-lg border border-white/10 shadow-2xl"
            style={{ backgroundColor: `rgba(0, 0, 0, ${popupOpacity / 100})` }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskbarButton;
