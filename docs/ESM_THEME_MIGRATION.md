# Migrating Themes to ESM-Only

## Overview

The theme system has been migrated to use ES Modules (ESM) exclusively. This change brings several benefits:

- Modern JavaScript standard
- Better tree-shaking and code-splitting
- More secure by avoiding global namespace pollution
- Better compatibility with modern tooling

## Changes for Theme Authors

If you're creating or maintaining a theme decorator, you need to make these changes:

### 1. Remove Global Window Assignment

**Before:**
```javascript
// Old approach with both ESM and global
export default MyThemeDecorator;
window.MyThemeDecorator = MyThemeDecorator;
```

**After:**
```javascript
// New ESM-only approach 
export default MyThemeDecorator;
```

### 2. Structure Your Decorator as ESM

Make sure your decorator is properly structured as an ES Module:

```javascript
// Import dependencies using ESM imports
import { someHelper } from './helpers.js';

// Export functions directly
export async function preload(previousTheme) {
  // Implementation
}

export function postload() {
  // Implementation
}

export function cleanup() {
  // Implementation
}

// Create your decorator object
const MyDecorator = {
  preload,
  postload,
  cleanup,
  Header: MyHeader,
  Controls: MyControls,
  borderRadius: 8,
};

// Only export as default
export default MyDecorator;
```

### 3. Cross-Origin Usage

If your theme needs to be loaded from a different origin (cross-site):

- Ensure the server provides proper CORS headers
- Use `Content-Type: application/javascript` or `text/javascript`
- Set up import maps if needed for your dependencies

## How the System Loads Your Theme

The system now uses dynamic ES Module imports to load your theme:

```javascript
// Internal loading mechanism (simplified)
const module = await import(decoratorPath);
const decoratorModule = module.default;
```

## Testing Your Theme

To test whether your theme works correctly with the new ESM-only system:

1. Remove any global `window.*` assignments from your decorator
2. Ensure you have a proper `export default` for your decorator object
3. Test in the application to verify it loads correctly

## Example Decorator

```javascript
// Example ESM-only decorator (simplified)
export async function preload(previousTheme) {
  // Load CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/themes/mytheme/style.css";
  return new Promise((resolve) => {
    link.onload = () => resolve(true);
    link.onerror = () => resolve(false);
    document.head.appendChild(link);
  });
}

function MyHeader({ title, onMinimize, onMaximize, onClose, headerRef }) {
  // Create header
}

// Export object as default
export default {
  preload,
  Header: MyHeader,
  borderRadius: 4
};
```

## Using Decorators in the Public Directory

If your theme decorator is placed in the `public` directory (e.g., `/public/themes/yourtheme/decorator.js`), the system handles it specially during development to work around Vite's restrictions on importing from the public directory:

1. In development mode, decorators in `/themes/` are fetched via AJAX instead of direct ESM imports
2. The content is converted to a Blob URL and then imported
3. In production, normal ESM imports are used since the restrictions don't apply

### Special Considerations for Public Directory Decorators

- Make sure your decorator file has proper CORS headers if serving from a different domain
- Keep your decorator structure standard with `export default` for the main object
- Avoid direct imports in your decorator file that wouldn't work when loaded via Blob URL

## Troubleshooting

- **Theme not loading**: Ensure you have a proper `export default` and that your module can be loaded via dynamic import
- **Components not rendering**: Check that your React components are properly included in the default export
- **CSS not loading**: Verify that your `preload` function is correctly exported and resolves its promise
- **Vite error with public files**: If you see errors about files in public directory that "should not be imported", make sure you're using the latest theme loader which handles this case

If issues persist, check browser console for errors related to module loading.
