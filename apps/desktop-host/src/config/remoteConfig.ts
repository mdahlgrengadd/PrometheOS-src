// Remote Configuration System for Dual-Pattern API Support

/**
 * Configuration for a Module Federation remote application
 */
export interface RemoteConfig {
  /** Unique identifier for the remote */
  id: string;

  /** Remote entry point URL */
  url: string;

  /** API pattern preference for this remote */
  apiPattern: 'context' | 'bridge' | 'auto';

  /** Exposed modules from this remote */
  exposes: string[];

  /** Additional metadata */
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
    framework?: 'react' | 'vue' | 'angular' | 'vanilla';
    /** Whether the remote supports React Context */
    supportsReactContext?: boolean;
  };
}

/**
 * Configuration for all remotes in the system
 */
export const REMOTE_CONFIGS: RemoteConfig[] = [
  {
    id: 'notepad',
    url: 'http://localhost:3001/remoteEntry.js',
    apiPattern: 'auto', // Let system choose the best pattern
    exposes: ['./App'],
    metadata: {
      name: 'Notepad',
      description: 'Text editing application',
      framework: 'react',
      supportsReactContext: true,
    },
  },
  // Future remotes can be added here
  // {
  //   id: 'calculator',
  //   url: 'http://localhost:3002/remoteEntry.js',
  //   apiPattern: 'context', // Force React Context for clean integration
  //   exposes: ['./App'],
  //   metadata: {
  //     name: 'Calculator',
  //     description: 'Mathematical calculator',
  //     framework: 'react',
  //     supportsReactContext: true,
  //   },
  // },
];

/**
 * Get configuration for a specific remote
 */
export function getRemoteConfig(remoteId: string): RemoteConfig | undefined {
  return REMOTE_CONFIGS.find(config => config.id === remoteId);
}

/**
 * Determine the optimal API pattern for a remote
 */
export function determineApiPattern(remoteId: string): 'context' | 'bridge' {
  const config = getRemoteConfig(remoteId);

  if (!config) {
    console.warn(`[Remote Config] No configuration found for ${remoteId}, defaulting to bridge pattern`);
    return 'bridge';
  }

  // If explicitly set, use that pattern
  if (config.apiPattern !== 'auto') {
    console.log(`[Remote Config] Using explicit ${config.apiPattern} pattern for ${remoteId}`);
    return config.apiPattern;
  }

  // Auto-detection logic
  const { metadata } = config;

  // React remotes with context support should use context pattern
  if (metadata?.framework === 'react' && metadata?.supportsReactContext) {
    console.log(`[Remote Config] Auto-detected context pattern for React remote: ${remoteId}`);
    return 'context';
  }

  // Non-React or legacy remotes should use bridge pattern
  console.log(`[Remote Config] Auto-detected bridge pattern for remote: ${remoteId} (framework: ${metadata?.framework || 'unknown'})`);
  return 'bridge';
}

/**
 * Get all configured remotes
 */
export function getAllRemoteConfigs(): RemoteConfig[] {
  return REMOTE_CONFIGS;
}

/**
 * Validate a remote configuration
 */
export function validateRemoteConfig(config: RemoteConfig): string[] {
  const errors: string[] = [];

  if (!config.id) {
    errors.push('Remote ID is required');
  }

  if (!config.url) {
    errors.push('Remote URL is required');
  }

  if (!['context', 'bridge', 'auto'].includes(config.apiPattern)) {
    errors.push('API pattern must be "context", "bridge", or "auto"');
  }

  if (!config.exposes || config.exposes.length === 0) {
    errors.push('At least one exposed module is required');
  }

  return errors;
}

/**
 * Add a new remote configuration at runtime
 */
export function addRemoteConfig(config: RemoteConfig): boolean {
  const errors = validateRemoteConfig(config);

  if (errors.length > 0) {
    console.error(`[Remote Config] Invalid configuration for ${config.id}:`, errors);
    return false;
  }

  // Check for duplicates
  const existingIndex = REMOTE_CONFIGS.findIndex(existing => existing.id === config.id);

  if (existingIndex >= 0) {
    console.log(`[Remote Config] Updating existing configuration for ${config.id}`);
    REMOTE_CONFIGS[existingIndex] = config;
  } else {
    console.log(`[Remote Config] Adding new configuration for ${config.id}`);
    REMOTE_CONFIGS.push(config);
  }

  return true;
}

/**
 * Remove a remote configuration
 */
export function removeRemoteConfig(remoteId: string): boolean {
  const index = REMOTE_CONFIGS.findIndex(config => config.id === remoteId);

  if (index >= 0) {
    REMOTE_CONFIGS.splice(index, 1);
    console.log(`[Remote Config] Removed configuration for ${remoteId}`);
    return true;
  }

  console.warn(`[Remote Config] No configuration found for ${remoteId}`);
  return false;
}