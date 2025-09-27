// Remote Registry - Manages Module Federation remotes
import React, { createContext, useContext, useEffect, useState } from 'react';

interface RemoteConfig {
  name: string;
  url: string;
  port: number;
  manifest?: any;
  status: 'loading' | 'ready' | 'error';
}

interface RemoteRegistryContextType {
  remotes: Map<string, RemoteConfig>;
  loadRemote: (name: string) => Promise<React.ComponentType | null>;
  registerRemote: (config: RemoteConfig) => void;
}

const RemoteRegistryContext = createContext<RemoteRegistryContextType | null>(null);

const DEFAULT_REMOTES: RemoteConfig[] = [
  {
    name: 'notepad',
    url: 'http://localhost:3001/remoteEntry.js',
    port: 3001,
    status: 'loading',
  },
  // {
  //   name: 'calculator',
  //   url: 'http://localhost:3002/remoteEntry.js',
  //   port: 3002,
  //   status: 'loading',
  // },
];

export const RemoteRegistry: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [remotes, setRemotes] = useState<Map<string, RemoteConfig>>(
    new Map(DEFAULT_REMOTES.map(remote => [remote.name, remote]))
  );

  const loadRemote = async (name: string): Promise<React.ComponentType | null> => {
    const remote = remotes.get(name);
    if (!remote) {
      console.error(`[RemoteRegistry] Remote ${name} not found`);
      return null;
    }

    try {
      console.log(`[RemoteRegistry] Loading remote: ${name} from ${remote.url}`);
      // Use static mapping for MF remote imports to let Webpack resolve containers
      let Component: React.ComponentType | undefined;
      switch (name) {
        case 'notepad': {
          const mod = await import('notepad/App');
          Component = mod.default;
          break;
        }
        default:
          console.error(`[RemoteRegistry] No loader configured for remote: ${name}`);
          break;
      }

      if (!Component) {
        throw new Error(`Remote ${name} does not export a default component`);
      }

      // Update remote status
      setRemotes(prev => {
        const updated = new Map(prev);
        const config = updated.get(name);
        if (config) {
          updated.set(name, { ...config, status: 'ready' });
        }
        return updated;
      });

      console.log(`[RemoteRegistry] Successfully loaded remote: ${name}`);
      return Component;

    } catch (error) {
      console.error(`[RemoteRegistry] Failed to load remote ${name}:`, error);

      // Update remote status
      setRemotes(prev => {
        const updated = new Map(prev);
        const config = updated.get(name);
        if (config) {
          updated.set(name, { ...config, status: 'error' });
        }
        return updated;
      });

      return null;
    }
  };

  const registerRemote = (config: RemoteConfig) => {
    console.log(`[RemoteRegistry] Registering remote: ${config.name}`);
    setRemotes(prev => new Map(prev).set(config.name, config));
  };

  // Initialize remote discovery
  useEffect(() => {
    console.log('[RemoteRegistry] Initializing remote discovery...');

    // In a real implementation, this would discover remotes from a registry service
    // For now, we use the default remotes

    remotes.forEach((remote, name) => {
      console.log(`[RemoteRegistry] Discovered remote: ${name} at ${remote.url}`);
    });
  }, [remotes]);

  const contextValue: RemoteRegistryContextType = {
    remotes,
    loadRemote,
    registerRemote,
  };

  return (
    <RemoteRegistryContext.Provider value={contextValue}>
      {children}
    </RemoteRegistryContext.Provider>
  );
};

export const useRemoteRegistry = (): RemoteRegistryContextType => {
  const context = useContext(RemoteRegistryContext);
  if (!context) {
    throw new Error('useRemoteRegistry must be used within a RemoteRegistry');
  }
  return context;
};
