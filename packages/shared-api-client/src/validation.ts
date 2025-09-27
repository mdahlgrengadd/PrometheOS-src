// Parameter validation for security - prevents injection attacks
import Ajv from 'ajv';

const ajv = new Ajv({ strict: false, validateFormats: false });

// Component action schemas registry
const actionSchemas = new Map<string, any>();

// Register action schema for validation
export function registerActionSchema(
  componentId: string,
  actionId: string,
  schema: any
): void {
  const key = `${componentId}.${actionId}`;
  actionSchemas.set(key, schema);
}

// Validate parameters against registered schema
export async function validateParameters(
  componentId: string,
  actionId: string,
  parameters?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const key = `${componentId}.${actionId}`;
  const schema = actionSchemas.get(key);

  // If no schema registered, apply basic sanitization
  if (!schema) {
    return sanitizeParameters(parameters);
  }

  // Validate against schema
  const validate = ajv.compile(schema);
  const valid = validate(parameters);

  if (!valid) {
    const errors = validate.errors?.map(err =>
      `${err.instancePath} ${err.message}`
    ).join(', ') || 'Validation failed';

    throw new Error(`Parameter validation failed for ${key}: ${errors}`);
  }

  return sanitizeParameters(parameters);
}

// Basic parameter sanitization
function sanitizeParameters(
  parameters?: Record<string, unknown>
): Record<string, unknown> {
  if (!parameters) return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(parameters)) {
    // Sanitize key names (prevent prototype pollution)
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    // Sanitize values
    if (typeof value === 'string') {
      // Prevent script injection in string values
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize objects
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } else {
        sanitized[key] = sanitizeParameters(value as Record<string, unknown>);
      }
    } else {
      // Numbers, booleans, null - pass through
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Sanitize string values
function sanitizeString(str: string): string {
  // Remove potential script injection patterns
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/Function\s*\(/gi, '');
}

// Common validation schemas for system actions
export const SYSTEM_SCHEMAS = {
  'sys.open': {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[a-zA-Z0-9-_]+$',
        maxLength: 50
      },
      initFromUrl: {
        type: 'string',
        maxLength: 10000
      }
    },
    required: ['name'],
    additionalProperties: false
  },

  'sys.kill': {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[a-zA-Z0-9-_]+$',
        maxLength: 50
      }
    },
    required: ['name'],
    additionalProperties: false
  },

  'sys.notify': {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        maxLength: 500
      },
      type: {
        type: 'string',
        enum: ['radix', 'sonner']
      }
    },
    required: ['message'],
    additionalProperties: false
  },

  'sys.dialog': {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        maxLength: 100
      },
      description: {
        type: 'string',
        maxLength: 500
      },
      confirmLabel: {
        type: 'string',
        maxLength: 50
      },
      cancelLabel: {
        type: 'string',
        maxLength: 50
      }
    },
    required: ['title'],
    additionalProperties: false
  },

  'sys.events.waitFor': {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        pattern: '^[a-zA-Z0-9-_:]+$',
        maxLength: 100
      },
      timeout: {
        type: 'number',
        minimum: 100,
        maximum: 300000 // 5 minutes max
      }
    },
    required: ['name'],
    additionalProperties: false
  }
};

// Initialize system schemas
export function initializeSystemSchemas(): void {
  for (const [action, schema] of Object.entries(SYSTEM_SCHEMAS)) {
    const [componentId, actionId] = action.split('.');
    registerActionSchema(componentId, actionId, schema);
  }
}