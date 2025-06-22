#!/usr/bin/env node

// Generate OpenAPI spec from fs.h enum definitions
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FS_HEADER = path.resolve(__dirname, '../src/core/include/fs.h');
const OUTPUT_FILE = path.resolve(__dirname, '../openapi/desktop.yaml');

async function generateOpenAPI() {
  try {
    // Read fs.h header file
    const headerContent = await fs.readFile(FS_HEADER, 'utf8');
    
    // Extract enum values for fs_msg_type_t
    const enumMatch = headerContent.match(/typedef enum\s*{([^}]+)}\s*fs_msg_type_t;/s);
    if (!enumMatch) {
      throw new Error('Could not find fs_msg_type_t enum in fs.h');
    }
    
    const enumContent = enumMatch[1];
    const messages = [];
    
    // Parse enum values
    const lines = enumContent.split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^(\w+)\s*=\s*(\d+)/);
      if (match) {
        messages.push({
          name: match[1],
          value: parseInt(match[2]),
          description: getMessageDescription(match[1])
        });
      }
    }
    
    // Generate OpenAPI YAML
    const openApiSpec = generateYAML(messages);
    
    // Ensure output directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    
    // Write output file
    await fs.writeFile(OUTPUT_FILE, openApiSpec);
    
    console.log(`✓ Generated OpenAPI spec: ${OUTPUT_FILE}`);
    console.log(`✓ Found ${messages.length} message types`);
    
  } catch (error) {
    console.error('✗ Failed to generate OpenAPI spec:', error.message);
    process.exit(1);
  }
}

function getMessageDescription(msgType) {
  const descriptions = {
    'FS_READ': 'Read data from filesystem',
    'FS_WRITE': 'Write data to filesystem with crash-safe semantics',
    'FS_RENAME': 'Atomically rename a file or directory',
    'FS_DELETE': 'Delete a file or directory',
    'FS_CHANGED': 'Notification that filesystem has changed'
  };
  return descriptions[msgType] || `Filesystem operation: ${msgType}`;
}

function generateYAML(messages) {
  const timestamp = new Date().toISOString();
  
  return `# Generated OpenAPI spec for WASM Desktop Filesystem
# Generated at: ${timestamp}
# Source: src/core/include/fs.h

openapi: 3.0.3
info:
  title: WASM Desktop Filesystem API
  description: Event-driven filesystem operations for browser-based desktop
  version: 1.0.0
  contact:
    name: WASM Core Team

servers:
  - url: /api/v1
    description: Local WASM kernel

paths:
  /fs/events:
    post:
      summary: Send filesystem event
      description: Post a filesystem operation event to the kernel
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FSMessage'
      responses:
        '200':
          description: Event processed successfully
        '400':
          description: Invalid message format
        '500':
          description: Kernel error

  /fs/events/stream:
    get:
      summary: Stream filesystem events
      description: Server-sent events stream of filesystem changes
      responses:
        '200':
          description: Event stream
          content:
            text/event-stream:
              schema:
                type: string

components:
  schemas:
    FSMessage:
      type: object
      required:
        - version
        - type
        - path
      properties:
        version:
          type: integer
          description: ABI version
          example: 1
        type:
          type: integer
          description: Message type
          enum: [${messages.map(m => m.value).join(', ')}]
        flags:
          type: integer
          description: Operation flags
          example: 0
        seq:
          type: integer
          description: Sequence number
          example: 1
        data_len:
          type: integer
          description: Length of data payload
          example: 0
        path:
          type: string
          maxLength: 19
          description: Filesystem path (truncated if > 19 chars)
          example: "/home/file.txt"
        data:
          type: string
          description: Optional data payload
          example: ""

    FSMessageType:
      type: integer
      description: Filesystem message types
      enum: [${messages.map(m => m.value).join(', ')}]
      x-enum-varnames: [${messages.map(m => `"${m.name}"`).join(', ')}]
      x-enum-descriptions:
${messages.map(m => `        ${m.value}: "${m.description}"`).join('\n')}

    FSEvent:
      type: object
      description: Filesystem change event
      properties:
        timestamp:
          type: string
          format: date-time
          description: Event timestamp
        message:
          $ref: '#/components/schemas/FSMessage'

  examples:
    WriteFile:
      summary: Write file example
      value:
        version: 1
        type: 2
        flags: 0
        seq: 1
        data_len: 13
        path: "/home/test.txt"
        data: "Hello, World!"

    ReadFile:
      summary: Read file example  
      value:
        version: 1
        type: 1
        flags: 0
        seq: 2
        data_len: 0
        path: "/home/test.txt"
        data: ""

    FileChanged:
      summary: File changed notification
      value:
        version: 1
        type: 5
        flags: 0
        seq: 3
        data_len: 0
        path: "/home/test.txt"
        data: ""

tags:
  - name: filesystem
    description: Filesystem operations
  - name: events
    description: Event streaming
`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateOpenAPI();
}

export { generateOpenAPI };
