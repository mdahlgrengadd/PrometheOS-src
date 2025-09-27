// A standard interface for theme decorators
export interface ThemeDecorator {
  Header: React.ComponentType<{
    title: string;
    onMinimize: () => void;
    onMaximize: () => void;
    onClose: () => void;
    headerRef: React.RefObject<HTMLDivElement>; // Ensure headerRef is properly typed
  }>;
  Controls?: React.ComponentType<{
    onMinimize: () => void;
    onMaximize: () => void;
    onClose: () => void;
  }>;
  borderRadius?: number;
  preload?: (previousTheme: string) => Promise<boolean>;
  postload?: () => void;
  cleanup?: () => void;
}
