// Basic type definitions for the Webamp library
// These are simplified from the daedalOS implementation and can be expanded as needed

export interface WebampTrack {
  url?: string;
  blob?: Blob;
  duration?: number;
  metaData?: {
    artist?: string;
    title?: string;
    album?: string;
  };
}

export interface WebampOptions {
  zIndex?: number;
  initialTracks?: WebampTrack[];
  availableSkins?: {
    name: string;
    url: string;
  }[];
}

export interface WebampStore {
  dispatch: (action: Record<string, unknown>) => void;
  getState: () => WebampState;
  subscribe: (listener: () => void) => () => void;
}

export interface WebampState {
  playlist?: {
    currentTrack?: number;
  };
  tracks?: WebampTrack[];
  [key: string]: unknown;
}

export interface WebampInstance {
  renderWhenReady: (domNode: HTMLElement) => Promise<void>;
  onClose: (callback: () => void) => () => void;
  onMinimize: (callback: () => void) => () => void;
  onTrackDidChange: (callback: (track: WebampTrack) => void) => () => void;
  appendTracks: (tracks: WebampTrack[]) => void;
  setTracksToPlay: (tracks: WebampTrack[]) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  close: () => void;
  dispose: () => void;
  store: WebampStore;
}

// Extend the Window interface to include Webamp properties
declare global {
  interface Window {
    Webamp: {
      new (options: WebampOptions): WebampInstance;
    };
    WebampGlobal: WebampInstance | undefined;
  }
}
