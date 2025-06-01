# API Component Setup Guide

This guide explains how to create API-enabled components that can be discovered and controlled by AI agents through our API explorer and OpenAPI documentation system. We'll use the Audio Player as a complete example.

## Table of Contents

1. [Overview](#overview)
2. [Approach 1: Individual Button API Configuration](#approach-1-individual-button-api-configuration)
3. [Approach 2: Provider-Based API Management](#approach-2-provider-based-api-management)
4. [Setting Up the Manifest](#setting-up-the-manifest)
5. [Creating External API Documentation](#creating-external-api-documentation)
6. [Best Practices](#best-practices)
7. [Testing Your Implementation](#testing-your-implementation)

## Overview

Our API system allows components to be discovered and controlled by AI agents. There are two main approaches:

- **Individual Button Configuration**: Each button/control has its own `apiState` configuration
- **Provider-Based Management**: A context provider manages API exposure for all child components

Both approaches use the same underlying API infrastructure but offer different levels of control and organization.

## Approach 1: Individual Button API Configuration

### Basic Button Setup

Each interactive element can be configured with `apiState` to control API visibility:

```tsx
import { Button } from "@/components/ui/button";

// API-enabled button (visible in API explorer)
<Button
  apiId="audio-play-button"
  apiState={{ enabled: true, visible: true }}
  onClick={handlePlay}
>
  Play
</Button>

// Hidden from API (not visible in API explorer)
<Button
  apiId="audio-pause-button"
  apiState={{ enabled: false, visible: false }}
  onClick={handlePause}
>
  Pause
</Button>
```

### Complete Audio Player Example

Here's how the audio player implements individual button configuration:

```tsx
// ui.tsx
const AudioPlayerUI = () => {
  const { isPlaying, onPlay, onPause, onNext, onPrevious } = useAudioPlayer();

  return (
    <div className="audio-player">
      {/* All buttons are hidden from API in this implementation */}
      <Button
        apiId="audio-play-button"
        apiState={{ enabled: false, visible: false }}
        onClick={onPlay}
        disabled={isPlaying}
      >
        <Play className="h-4 w-4" />
      </Button>

      <Button
        apiId="audio-pause-button"
        apiState={{ enabled: false, visible: false }}
        onClick={onPause}
        disabled={!isPlaying}
      >
        <Pause className="h-4 w-4" />
      </Button>

      <Button
        apiId="audio-next-button"
        apiState={{ enabled: false, visible: false }}
        onClick={onNext}
      >
        <SkipForward className="h-4 w-4" />
      </Button>

      <Button
        apiId="audio-previous-button"
        apiState={{ enabled: false, visible: false }}
        onClick={onPrevious}
      >
        <SkipBack className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

## Approach 2: Provider-Based API Management

### Context Provider Setup

The provider approach centralizes API management and allows for more sophisticated control:

```tsx
// AudioPlayerContext.tsx
import { useApiComponent } from "@/api/hoc/withApi";
import { registerApiActionHandler } from "@/api/context/ApiContext";

type ApiExposureLevel = boolean | "full" | "readonly" | "hidden";

export const AudioPlayerProvider: React.FC<{
  apiId: string;
  children: React.ReactNode;
  exposeApi?: ApiExposureLevel;
  // ... other props
}> = ({
  apiId,
  children,
  exposeApi = true,
  onPlay,
  onPause,
  // ... other handlers
}) => {
  // Load static API documentation
  const staticApiDoc = useMemo(() => {
    const { state, ...doc } = audioPlayerApiDoc;
    return doc;
  }, []);

  // Register component with API system
  const { updateState } = useApiComponent(
    exposeApi ? apiId : `hidden-${apiId}`,
    exposeApi ? staticApiDoc : hiddenApiDoc
  );

  // Register action handlers
  useEffect(() => {
    if (exposeApi) {
      registerApiActionHandler(apiId, "play", async () => {
        onPlay();
        return { success: true };
      });

      registerApiActionHandler(apiId, "pause", async () => {
        onPause();
        return { success: true };
      });

      // ... register other handlers
    }
  }, [exposeApi, apiId, onPlay, onPause]);

  // Update component state
  useEffect(() => {
    if (exposeApi) {
      updateState({ isPlaying, currentTrack, volume, isMuted });
    }
  }, [exposeApi, isPlaying, currentTrack, volume, isMuted]);

  return (
    <AudioPlayerContext.Provider value={/* ... */}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
```

### Using the Provider

```tsx
// Main component implementation
const AudioPlayerContent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  // ... other state

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  // ... other handlers

  return (
    <AudioPlayerProvider
      apiId="audioplayer-main"
      exposeApi={true} // Set to false to hide from API
      isPlaying={isPlaying}
      currentTrack={currentTrack}
      onPlay={handlePlay}
      onPause={handlePause}
      // ... other props
    >
      <AudioPlayerUI />
    </AudioPlayerProvider>
  );
};
```

## Setting Up the Manifest

### Step 1: Create the Plugin Manifest

```tsx
// manifest.tsx
import { PluginManifest } from "../../../plugins/types";
import { ApiComponentJson } from "../../../api/core/types";
import * as audioPlayerApiDocModule from "./audioplayer-openapi.json";

// Import and cast the JSON API documentation
const audioPlayerApiDoc = audioPlayerApiDocModule as ApiComponentJson;

export { audioPlayerApiDoc };

export const manifest: PluginManifest & { apiDoc?: typeof audioPlayerApiDoc } = {
  id: "audioplayer",
  name: "Audio Player",
  version: "1.0.0",
  description: "A modern audio player",
  author: "Desktop System",
  icon: <AudioPlayerIcon />,
  entry: "apps/audioplayer",
  preferredSize: {
    width: 600,
    height: 400,
  },
  // Include the API documentation in the manifest
  apiDoc: audioPlayerApiDoc,
  hideWindowChrome: true,
};
```

### Step 2: Register the Plugin

```tsx
// index.tsx
import { Plugin } from '../../types';
import { manifest } from './manifest';
import AudioPlayerContent from './ui';

const AudioPlayerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Audio Player plugin initialized");
  },
  render: () => <AudioPlayerContent />,
};

export default AudioPlayerPlugin;
```

## Creating External API Documentation

### Step 1: Create the JSON API Documentation

Create a separate JSON file for your API documentation:

```json
// audioplayer-openapi.json
{
  "type": "AudioPlayer",
  "description": "An audio player component with playback controls",
  "state": {
    "enabled": true,
    "visible": true,
    "isPlaying": false,
    "currentTrack": 0,
    "volume": 1.0,
    "isMuted": false
  },
  "actions": [
    {
      "id": "play",
      "name": "Play",
      "description": "Start playback of current track",
      "available": true,
      "parameters": []
    },
    {
      "id": "pause",
      "name": "Pause",
      "description": "Pause playback of current track",
      "available": true,
      "parameters": []
    },
    {
      "id": "setVolume",
      "name": "Set Volume",
      "description": "Set the volume level",
      "available": true,
      "parameters": [
        {
          "name": "volume",
          "type": "number",
          "description": "Volume level (0.0 to 1.0)",
          "required": true
        }
      ]
    }
  ],
  "path": "/apps/audioplayer"
}
```

### Step 2: Use the Global Type Definition

Always use the global `ApiComponentJson` type for consistency:

```tsx
import { ApiComponentJson } from "../../../api/core/types";
import * as apiDocModule from "./my-component-openapi.json";

const myComponentApiDoc = apiDocModule as ApiComponentJson;
```

### JSON Schema Reference

The `ApiComponentJson` interface defines the structure:

```typescript
export interface ApiComponentJson {
  /** Type of component (Button, Input, AudioPlayer, etc.) */
  type: string;

  /** Human-readable description of what the component does */
  description: string;

  /** Current state of the component with flexible properties */
  state: {
    enabled: boolean;
    visible: boolean;
    /** Allow any additional state properties */
    [key: string]: unknown;
  };

  /** Available actions that can be performed on this component */
  actions: Array<{
    id: string;
    name: string;
    description: string;
    available: boolean;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
    }>;
  }>;

  /** Path to the component in the application */
  path: string;
}
```

## Best Practices

### 1. Consistent Naming

- Use descriptive `apiId` values: `"audioplayer-play-button"` not `"btn1"`
- Action IDs should be clear: `"play"`, `"pause"`, `"setVolume"`
- Component types should be descriptive: `"AudioPlayer"`, `"TextEditor"`

### 2. State Management

- Always include `enabled` and `visible` in state
- Add component-specific state properties as needed
- Keep state properties JSON-serializable

### 3. Action Parameters

- Always include `required` field for parameters
- Use standard types: `"string"`, `"number"`, `"boolean"`
- Provide clear descriptions for parameters

### 4. Visibility Control

```tsx
// Hide individual buttons from API
<Button apiState={{ enabled: false, visible: false }}>

// Hide entire component from API
<AudioPlayerProvider exposeApi={false}>

// Show in API explorer but disable actions
<Button apiState={{ enabled: false, visible: true }}>
```

### 5. Error Handling

```tsx
registerApiActionHandler(apiId, "setVolume", async (params) => {
  if (!params || typeof params.volume !== "number") {
    return { 
      success: false, 
      error: "setVolume requires 'volume' parameter of type number" 
    };
  }
  
  const volume = Math.max(0, Math.min(1, params.volume));
  onSetVolume(volume);
  return { success: true };
});
```

## Testing Your Implementation

### 1. Check API Explorer

1. Start your development server
2. Open the API Explorer app
3. Verify your component appears (if `visible: true`)
4. Test that actions work correctly

### 2. Check OpenAPI Documentation

1. Navigate to `/apps/api-explorer`
2. Open the Swagger UI tab
3. Verify your component's endpoints are documented
4. Test API calls through the Swagger interface

### 3. Verify Filtering

1. Set `visible: false` in your component
2. Restart the application
3. Confirm the component doesn't appear in API explorer
4. Confirm it's excluded from OpenAPI documentation

### 4. Test State Updates

1. Interact with your component normally
2. Check that state updates appear in the API explorer
3. Verify real-time state synchronization

## Troubleshooting

### Component Not Appearing in API Explorer

- Check that `visible: true` in the component state
- Verify the component is properly registered with `useApiComponent`
- Ensure the manifest includes `apiDoc`

### Actions Not Working

- Verify action handlers are registered with `registerApiActionHandler`
- Check that action IDs match between JSON doc and handlers
- Ensure handlers return proper success/error responses

### State Not Updating

- Call `updateState()` whenever component state changes
- Verify state properties are JSON-serializable
- Check that the component is not hidden (`exposeApi: false`)

### TypeScript Errors

- Use the global `ApiComponentJson` type for JSON imports
- Ensure all required properties are present in your JSON
- Check that parameter types match the schema

---

This guide provides a complete reference for creating API-enabled components. The Audio Player serves as a working example of both individual button configuration and provider-based management approaches.
