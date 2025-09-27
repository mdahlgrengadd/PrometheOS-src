// Global type definitions for Module Federation host

declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: any) => void;
      identify: (userId: string, traits?: any) => void;
      page: (name?: string, properties?: any) => void;
    };
  }
}

export {};