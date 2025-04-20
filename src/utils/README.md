# Utilities

This directory contains utility functions used throughout the application.

## `validateConnection.ts`

Provides validation logic for connections between nodes in the workflow editor.

```typescript
function validateConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
): { valid: boolean; reason?: string }
```

**Parameters:**
- `connection`: The proposed connection to validate
- `nodes`: Current nodes in the flow
- `edges`: Current edges in the flow

**Returns:** An object with:
- `valid`: Boolean indicating if the connection is valid
- `reason`: (Optional) string explaining why the connection is invalid

**Validations performed:**
1. Prevents connections within the same node
2. Ensures execution pins connect only to other execution pins
3. Verifies data pins have compatible data types
4. Prevents cycles in execution flow
5. Checks if pins accept multiple connections

**Example:**
```typescript
// In your onConnect callback:
const validationResult = validateConnection(connection, getNodes(), getEdges());
if (!validationResult.valid) {
  console.warn(`Invalid connection: ${validationResult.reason}`);
  return; // Prevent the connection
}
// Proceed with creating the connection...
```

## `parameterMapping.ts`

Provides utilities for mapping node parameters to connections in the workflow editor.

### `mapSetValueAction`

Maps a setValue action to a node when connecting from primitive nodes.

```typescript
function mapSetValueAction(
  nodeData: ApiAppNodeData, 
  targetHandle: string
): ApiAppNodeData
```

**Parameters:**
- `nodeData`: The target node's data (API App Node)
- `targetHandle`: The ID of the target handle receiving the connection

**Returns:** Updated node data with parameter mapping added

### `mapGeneralAction`

Maps a general action for connections between API nodes.

```typescript
function mapGeneralAction(
  nodeData: ApiAppNodeData, 
  targetHandle: string
): ApiAppNodeData
```

**Parameters:**
- `nodeData`: The target node's data (API App Node)
- `targetHandle`: The ID of the target handle receiving the connection

**Returns:** Updated node data with parameter mapping added

**Example:**
```typescript
// When connecting a primitive node to an API node:
if (isPrimitiveSource) {
  return {
    ...node,
    data: mapSetValueAction(nodeData, connection.targetHandle!)
  };
} else {
  return {
    ...node,
    data: mapGeneralAction(nodeData, connection.targetHandle!)
  };
}
``` 