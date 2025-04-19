# Hooks

This directory contains custom React hooks used throughout the application.

## `usePin.ts`

Contains factory hooks for creating pins in the workflow editor:

### `useDataPin`

Creates a data pin with specified type, data type, and label.

```typescript
function useDataPin(
  type: 'input' | 'output',
  dataType: PinDataType, 
  label: string
): Pin
```

**Parameters:**
- `type`: Whether this is an input pin or output pin
- `dataType`: The data type this pin accepts/emits (string, number, boolean, object, array)
- `label`: Display label for the pin

**Returns:** A Pin object with a unique ID

**Example:**
```typescript
// Create an input string pin
const nameInputPin = useDataPin('input', 'string', 'Name');

// Create an output object pin
const resultOutputPin = useDataPin('output', 'object', 'Result');
```

### `useExecPin`

Creates an execution pin with specified label and direction.

```typescript
function useExecPin(
  label: string, 
  direction: 'in' | 'out'
): Pin
```

**Parameters:**
- `label`: Display label for the pin (typically "In", "Out", "Success", etc.)
- `direction`: Whether this is an incoming or outgoing execution pin

**Returns:** A Pin object with a unique ID and `type` set to "execution"

**Example:**
```typescript
// Create an incoming execution pin
const execInPin = useExecPin('In', 'in');

// Create an outgoing execution pin
const successPin = useExecPin('Success', 'out');
```

## Usage Notes

1. These hooks must be called directly inside React components or custom hooks, not inside callbacks or conditionals
2. Each call to these hooks creates a new unique pin
3. For dynamic pins based on changing values, use the useMemo hook:

```typescript
const dynamicPin = useMemo(() => 
  useDataPin('input', selectedDataType, 'Dynamic Input'), 
  [selectedDataType]
);
``` 