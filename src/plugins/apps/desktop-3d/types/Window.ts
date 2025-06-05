export interface WindowData {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  originalState?: {
    position: { x: number; y: number; z: number };
    size: { width: number; height: number };
  };
}

export interface WindowProps {
  window: WindowData;
  onDrag: (id: string, position: { x: number; y: number; z: number }) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
}
