# API Explorer Plugin

## Overview

The API Explorer plugin provides a comprehensive interface for exploring and testing the PrometheOS API system. It includes both a custom frontend explorer and a Swagger UI (FastAPI style) view.

## Components

- **ApiExplorerSwitcher**: Main component that allows switching between different explorer views
- **BetterFrontendExplorer**: Custom API explorer with search, filtering, and direct action execution
- **SwaggerExplorer**: FastAPI-style Swagger UI for standard OpenAPI documentation
- **GettingStarted**: Documentation component for new users

## CSS Isolation

### Problem
The API Explorer was inheriting CSS variables from the IDE Builder plugin, causing theme changes in the IDE Builder to affect the API Explorer's appearance when it should remain independent.

### Solution
We implemented CSS scope isolation using the `.api-explorer-isolated` class:

1. **Isolated CSS Variables**: Created API Explorer-specific CSS variables (prefixed with `--api-explorer-`)
2. **Scope Override**: Applied the isolation class to the root API Explorer container
3. **Variable Mapping**: Mapped global CSS variables to our isolated ones within the scope
4. **High Specificity Overrides**: Used `!important` declarations to ensure our variables take precedence

### Implementation Details

```tsx
// ApiExplorerSwitcher.tsx
<div className="h-full flex flex-col api-explorer-isolated">
  {/* All child components now use isolated CSS variables */}
</div>
```

```css
/* isolated.css */
.api-explorer-isolated {
  /* Define isolated variables */
  --api-explorer-background: 0 0% 100%;
  --api-explorer-foreground: 222.2 84% 4.9%;
  
  /* Override global variables within this scope */
  --background: var(--api-explorer-background);
  --foreground: var(--api-explorer-foreground);
  /* ... more variables */
}
```

### Benefits

1. **Theme Independence**: API Explorer maintains consistent styling regardless of IDE Builder theme changes
2. **Maintainability**: Easy to update API Explorer theme without affecting other plugins
3. **Flexibility**: Can be extended to support dark mode or custom themes specifically for API Explorer
4. **No Side Effects**: Other plugins remain unaffected by this isolation

## Usage

The API Explorer automatically loads when the plugin is activated. No additional configuration is required for the CSS isolation - it's applied automatically to all API Explorer components.

## Files

- `components/ApiExplorerSwitcher.tsx` - Main switcher component
- `components/BetterFrontendExplorer.jsx` - Custom frontend explorer
- `components/SwaggerExplorer.tsx` - Swagger UI wrapper
- `styles/isolated.css` - CSS isolation implementation
- `index.tsx` - Plugin entry point
- `manifest.ts` - Plugin manifest
