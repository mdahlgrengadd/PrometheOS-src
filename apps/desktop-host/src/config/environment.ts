// Environment Configuration
// Modify these URLs for different deployment environments

export const CONFIG = {
  // Host configuration
  HOST_URL: 'http://localhost:3011',
  
  // Remote application URLs
  NOTEPAD_REMOTE_URL: 'http://localhost:3001',
  CALCULATOR_REMOTE_URL: 'http://localhost:3002',
  
  // Shared package URLs
  SHARED_UI_KIT_URL: 'http://localhost:3003',
  
  // Development server configuration
  DEV_SERVER_PORT: 3011,
  DEV_SERVER_HOST: 'localhost',
} as const;

// Environment-specific configurations
export const ENVIRONMENTS = {
  development: {
    ...CONFIG,
  },
  
  staging: {
    ...CONFIG,
    HOST_URL: 'https://staging-desktop.your-domain.com',
    NOTEPAD_REMOTE_URL: 'https://staging-notepad.your-domain.com',
    CALCULATOR_REMOTE_URL: 'https://staging-calculator.your-domain.com',
    SHARED_UI_KIT_URL: 'https://staging-ui-kit.your-domain.com',
  },
  
  production: {
    ...CONFIG,
    HOST_URL: 'https://desktop.your-domain.com',
    NOTEPAD_REMOTE_URL: 'https://notepad.your-domain.com',
    CALCULATOR_REMOTE_URL: 'https://calculator.your-domain.com',
    SHARED_UI_KIT_URL: 'https://ui-kit.your-domain.com',
  },
} as const;

// Get current environment (defaults to development)
const getCurrentEnvironment = (): keyof typeof ENVIRONMENTS => {
  // In a real application, this could be determined by:
  // - Build-time environment variables
  // - URL hostname
  // - Local storage settings
  // - Query parameters
  return 'development';
};

// Export the active configuration
export const ACTIVE_CONFIG = ENVIRONMENTS[getCurrentEnvironment()];
