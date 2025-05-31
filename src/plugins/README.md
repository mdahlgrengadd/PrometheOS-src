# PromethOS Plugin Architecture

This document explains how to create new applications (plugins) for the PromethOS environment and how to implement API functionality so your app can be controlled via the API Explorer.

## Table of Contents

- [Overview](#overview)
- [Creating a New Plugin](#creating-a-new-plugin)
- [Plugin Lifecycle](#plugin-lifecycle)
- [Implementing API Functionality](#implementing-api-functionality)
- [Best Practices](#best-practices)
- [Key API Registration Fixes](#key-api-registration-fixes)
- [Examples](#examples)

## Overview

The PromethOS uses a plugin-based architecture where each application is a self-contained plugin. Plugins are loaded dynamically at runtime and can interact with each other through the API system. The API system allows components to expose functionality that can be discovered and called by other parts of the application or by AI agents.

## Creating a New Plugin

To create a new plugin, follow these steps:

1. Create a new folder in `src/plugins/apps/` with your app name
2. Create an `index.tsx` file that exports a plugin manifest and the plugin itself
3. Implement your UI components
4. Register your plugin in the plugin system

### Basic Plugin Structure

Here's a minimal plugin structure:

```tsx
// src/plugins/apps/myapp/index.tsx
import React from 'react';
import { Plugin, PluginManifest } from '../../types';

// Define the plugin manifest
export const manifest: PluginManifest = {
  id: "myapp",
  name: "My Application",
  version: "1.0.0",
  description: "A description of your app",
  author: "Your Name",
  icon: <div className="h-8 w-8 bg-blue-500 rounded-full"></div>, // Custom icon
  entry: "apps/myapp",
  preferredSize: {
    width: 600,
    height: 400,
  },
};

// Main component for your app
const MyAppComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">My App</h1>
      <p>This is my new application</p>
    </div>
  );
};

// Create the plugin object
const MyPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("My app plugin initialized");
  },
  render: () => {
    return <MyAppComponent />;
  },
};

export default MyPlugin;
```

## Plugin Lifecycle

Plugins have the following lifecycle methods:

- `init`: Called when the plugin is first loaded
- `onActivate`: Called when the plugin is activated
- `onDeactivate`: Called when the plugin is deactivated
- `onOpen`: Called when the app window is opened
- `onClose`: Called when the app window is closed
- `onMinimize`: Called when the app window is minimized
- `onMaximize`: Called when the app window is maximized
- `render`: Called to render the plugin's UI

Example with lifecycle methods:

```tsx
const MyPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Plugin initialized");
  },
  onActivate: () => {
    console.log("Plugin activated");
  },
  onDeactivate: () => {
    console.log("Plugin deactivated");
  },
  onOpen: () => {
    console.log("Window opened");
  },
  onClose: () => {
    console.log("Window closed");
  },
  render: () => {
    return <MyAppComponent />;
  },
};
```

## Implementing API Functionality

To make your app interactive through the API Explorer, you need to:

1. Create API-enabled components using the `withApi` Higher Order Component
2. Define actions that can be called
3. Implement handlers for those actions

### Step 1: Create an API Component

Use one of the existing API components or create a custom one:

```tsx
// Using existing API components
-import { ApiButton } from '@/components/api/ApiButton';
+import { Button } from '@/components/ui/api/button';

// Inside your component:
return (
  <div>
    <Button
      apiId="myapp-button"
      onClick={handleClick}
    >
      Click Me
    </Button>
    
    <Textarea
      apiId="myapp-textarea"
      value={text}
      onChange={handleTextChange}
    />
  </div>
);
```

### Step 2: Creating a Custom API Component

For more complex functionality, create a custom API component:

```tsx
// src/plugins/apps/myapp/MyCustomComponent.tsx
import React, { useEffect } from 'react';
import { registerApiActionHandler } from '@/api/context/ApiContext';
import { IActionResult, IApiAction } from '@/api/core/types';
import { withApi } from '@/api/hoc/withApi';

// Define the API documentation
export const myComponentApiDoc = {
  type: "MyCustomComponent",
  description: "A custom component with API functionality",
  state: {
    enabled: true,
    visible: true,
    value: "",
  },
  actions: [
    {
      id: "myAction",
      name: "My Action",
      description: "Does something awesome",
      available: true,
      parameters: [
        {
          name: "param1",
          type: "string",
          description: "First parameter",
          required: true,
        },
      ],
    } as IApiAction,
  ],
  path: "/components/mycustom",
};

// Create a component with API handlers
export const MyCustomApiComponent: React.FC<{
  apiId: string;
  onAction: (param: string) => void;
  value: string;
}> = ({ apiId, onAction, value }) => {
  // Track handler registration
  const registeredRef = React.useRef(false);
  
  // Active registrations map
  const activeRegistrations = React.useRef(new Map<string, number>());
  
  useEffect(() => {
    // Increment reference count
    const count = activeRegistrations.current.get(apiId) || 0;
    activeRegistrations.current.set(apiId, count + 1);
    
    // Register once per instance
    if (!registeredRef.current) {
      registeredRef.current = true;
      console.log(`Registering handler for ${apiId}`);
      
      // Define the action handler
      const myActionHandler = async (params?: Record<string, unknown>): Promise<IActionResult> => {
        try {
          if (!params || typeof params.param1 !== "string") {
            return {
              success: false,
              error: "Action requires a param1 parameter of type string",
            };
          }
          
          // Call the handler function
          onAction(params.param1 as string);
          
          return {
            success: true,
            data: { message: "Action executed successfully" },
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };
      
      // Register the action handler
      registerApiActionHandler(apiId, "myAction", myActionHandler);
    }
    
    // Clean up on unmount
    return () => {
      // Decrement reference count
      const count = activeRegistrations.current.get(apiId) || 0;
      if (count > 0) {
        activeRegistrations.current.set(apiId, count - 1);
      }
      
      // Only actually consider unregistered when count is 0
      if (count <= 1) {
        registeredRef.current = false;
      }
    };
  }, [apiId, onAction]);
  
  // Create a wrapper component with API
  const ApiWrapper = withApi(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    {
      ...myComponentApiDoc,
      state: {
        enabled: true,
        visible: true,
        value,
      },
    }
  );
  
  return (
    <ApiWrapper apiId={apiId}>
      <div className="my-custom-component">
        {/* Your component UI here */}
        <div>Current value: {value}</div>
      </div>
    </ApiWrapper>
  );
};
```

### Step 3: Using Your Custom API Component

```tsx
// In your main app component
const MyAppComponent: React.FC = () => {
  const [value, setValue] = useState("Initial value");
  
  const handleAction = (param: string) => {
    console.log("Action called with param:", param);
    setValue(param);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">My App</h1>
      
      <MyCustomApiComponent
        apiId="myapp-custom"
        onAction={handleAction}
        value={value}
      />
    </div>
  );
};
```

## Best Practices

1. **Unique API IDs**: Ensure your API IDs are unique by prefixing them with your app name.
2. **Proper Handler Registration**: Use the reference counting pattern to avoid registration/unregistration loops.
3. **Memoization**: Use React.memo to prevent unnecessary re-renders.
4. **Dependency Management**: Keep your useEffect dependencies minimal and explicit.
5. **State Updates**: Avoid excessive state updates that can cause re-renders.
6. **Documentation**: Provide clear descriptions for your components and actions.
7. **Error Handling**: Always handle errors gracefully in your action handlers.

### Avoiding Common Pitfalls

1. **Registration Loops**: The `withApi` HOC ensures components register once on mount and unregister once on unmount. Don't add extra registration logic.

2. **Handler Re-Creation**: Be careful about dependencies in your useEffect for handler registration. Include only what's necessary.

3. **Proper Cleanup**: Always clean up registrations when components unmount.

## Key API Registration Fixes

The plugin system has been improved with several key fixes to prevent common issues with API registration:

### 1. Fixed Core Registration System

The `withApi` HOC has been modified to use separate useEffect hooks with empty dependency arrays:

```tsx
// Registration - runs exactly once on mount
useEffect(() => {
  // Register component
  registerComponent(fullApiDoc);
  isRegisteredRef.current = true;
}, []); // Empty dependency array - only runs on mount

// Cleanup - runs exactly once on unmount
useEffect(() => {
  return () => {
    // Unregister component
    unregisterComponent(uniqueId.current);
  };
}, []); // Empty dependency array - cleanup runs on unmount
```

This ensures components register exactly once on mount and unregister once on unmount, preventing registration loops and duplicate registrations.

### 2. Reference Counting for Action Handlers

Instead of a binary "registered/not registered" approach, we now track how many active instances exist:

```tsx
// Module-level tracker for active registrations
const activeRegistrations = new Map<string, number>();

// In your component's useEffect:
const count = activeRegistrations.get(apiId) || 0;
activeRegistrations.set(apiId, count + 1);

// Only register if this instance hasn't registered yet
if (!registeredRef.current) {
  registeredRef.current = true;
  // Register handlers...
}

// Cleanup on unmount
return () => {
  const count = activeRegistrations.get(apiId) || 0;
  if (count > 0) {
    activeRegistrations.set(apiId, count - 1);
  }
  registeredRef.current = false;
};
```

This prevents both too many registrations and accidentally blocking legitimate new registrations.

### 3. Component Stability Optimizations

Components are now optimized to prevent unnecessary re-renders:

```tsx
// Use React.memo with custom comparison
export const MemoizedComponent = React.memo(
  MyComponent,
  (prevProps, nextProps) => {
    // Only re-render for specific prop changes
    return (
      prevProps.id === nextProps.id &&
      prevProps.value === nextProps.value
    );
  }
);

// State update optimizations
useEffect(() => {
  if (isRegisteredRef.current && api?.state) {
    // Only update if state has actually changed
    const hasStateChanged = Object.entries(api.state).some(
      ([key, value]) => prevStateRef.current[key] !== value
    );
    
    if (hasStateChanged) {
      updateComponentState(apiId, api.state);
      prevStateRef.current = { ...api.state };
    }
  }
}, [api?.state, updateComponentState]);
```

### 4. Thorough Error Handling

All API action handlers now include proper error handling:

```tsx
const myActionHandler = async (params?: Record<string, unknown>): Promise<IActionResult> => {
  try {
    // Input validation
    if (!params || typeof params.param1 !== "string") {
      return {
        success: false,
        error: "Action requires a param1 parameter of type string",
      };
    }
    
    // Action execution
    const result = await someFunction(params.param1 as string);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Proper error conversion
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};
```

By following these patterns, your components will avoid the common pitfalls of API registration and work reliably with the API Explorer.

## Examples

Look at existing plugins for reference implementations:

1. **Notepad**: `src/plugins/apps/notepad/` - Shows how to use `ApiTextareaWithHandler`
2. **Audio Player**: `src/plugins/apps/audioplayer/` - Shows a complex implementation with custom action handlers and reference counting
3. **API Explorer**: `src/plugins/apps/api-explorer/` - Shows how to discover and call API endpoints

## Testing Your API

Once your plugin is implemented with API functionality:

1. Launch the PromethOS
2. Open your app
3. Open the API Explorer
4. Your components should appear in the list of available components
5. You can see the available actions and execute them from the explorer

---

For more details, check the API implementation in `src/api/` and existing plugins in `src/plugins/apps/`.