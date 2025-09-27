// API types for Module Federation host application

export interface ApiContext {
  version: string;
  hostUrl: string;
  remotes: Record<string, string>;
}

export interface ApiProvider {
  getContext: () => ApiContext;
  initializeRemotes: () => Promise<void>;
}

export interface RemoteModule {
  id: string;
  name: string;
  url: string;
  status: 'loading' | 'ready' | 'error';
}

export interface ApiConfig {
  host: {
    port: number;
    url: string;
  };
  remotes: Record<string, RemoteModule>;
}

export interface IActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface IApiAction {
  id: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
}

export interface IApiComponent {
  id: string;
  type: string;
  name: string;
  description: string;
  actions: IApiAction[];
  state: Record<string, any>;
}