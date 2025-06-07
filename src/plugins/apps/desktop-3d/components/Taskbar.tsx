import { Clock, Search, Settings, Wifi } from "lucide-react";
import React from "react";

import { WindowData } from "../types/Window";
import LayoutControls, { IconSize } from "./LayoutControls";
import SearchPopup from "./SearchPopup";
import TaskbarButton from "./TaskbarButton";

// Camera control options interface
interface CameraControlOptions {
  enabled?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  lockRotationX?: boolean;
  lockRotationY?: boolean;
  lockRotationZ?: boolean;
  lockPanX?: boolean;
  lockPanY?: boolean;
  minDistance?: number;
  maxDistance?: number;
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
}

interface TaskbarProps {
  windows: WindowData[];
  onWindowRestore: (id: string) => void;
  onToggleLayoutControls?: () => void;
  onLayoutChange?: (
    layout: "table" | "sphere" | "helix" | "grid" | "columns"
  ) => void;
  currentLayout?: "table" | "sphere" | "helix" | "grid" | "columns";
  iconSize?: IconSize;
  onIconSizeChange?: (size: IconSize) => void;
  animationRandomness?: {
    maxRandomDelay: number;
    speedVariation: number;
  };
  onRandomnessChange?: (randomness: {
    maxRandomDelay: number;
    speedVariation: number;
  }) => void;
  cameraControls?: CameraControlOptions;
  onCameraControlsChange?: (controls: CameraControlOptions) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onWindowRestore,
  onToggleLayoutControls,
  onLayoutChange,
  currentLayout = "table",
  iconSize,
  onIconSizeChange,
  animationRandomness,
  onRandomnessChange,
  cameraControls,
  onCameraControlsChange,
}) => {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-black/30 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-4 z-50">
      {" "}
      {/* Start Menu */}
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-white/10 rounded transition-colors">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
        </button>{" "}
        <TaskbarButton
          icon={Search}
          tooltip="Search"
          side="left"
          popupOpacity={25}
        >
          <SearchPopup />
        </TaskbarButton>
      </div>
      {/* Window Tasks */}
      <div className="flex items-center space-x-1 flex-1 justify-center">
        {windows.map((window) => (
          <button
            key={window.id}
            onClick={() => onWindowRestore(window.id)}
            className={`px-3 py-1 text-xs text-white rounded transition-all ${
              window.isMinimized
                ? "bg-white/10 hover:bg-white/20"
                : "bg-blue-500/30 hover:bg-blue-500/50"
            }`}
          >
            {window.title}
          </button>
        ))}
      </div>{" "}
      {/* System Tray */}
      <div className="flex items-center space-x-2 text-white">
        {" "}
        <TaskbarButton
          icon={Settings}
          tooltip="Layout Settings"
          side="right"
          popupOpacity={25}
        >
          {" "}
          {onLayoutChange && (
            <LayoutControls
              onLayoutChange={onLayoutChange}
              currentLayout={currentLayout}
              iconSize={iconSize}
              onIconSizeChange={onIconSizeChange}
              animationRandomness={animationRandomness}
              onRandomnessChange={onRandomnessChange}
              cameraControls={cameraControls}
              onCameraControlsChange={onCameraControlsChange}
              isPopup={true}
              side="right"
            />
          )}
        </TaskbarButton>
        <Wifi size={16} />
        <span className="text-sm">{currentTime}</span>
      </div>
    </div>
  );
};

export default Taskbar;
