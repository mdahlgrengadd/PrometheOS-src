# Theme Authoring Guide

This guide explains how to create custom themes for our desktop environment. Themes allow you to customize the entire look and feel of the OS without touching any code.

## Theme Manifest Structure

A theme is defined by a JSON manifest file that follows this structure:

```json
{
  "id": "my-theme",
  "name": "My Custom Theme",
  "author": "Your Name",
  "version": "1.0.0",
  "description": "A beautiful custom theme for the desktop environment",
  "cssUrl": "/themes/my-theme/style.css",
  "preview": "/themes/my-theme/preview.png",
  "desktopBackground": "#f0f0f0",
  "decoratorPath": "/themes/my-theme/decorator.js",
  "cssVariables": {
    "--wm-border-width": "1px",
    "--wm-border-color": "#cccccc",
    "--wm-border-radius": "8px",
    "--wm-header-height": "30px",
    "--window-background": "#ffffff",
    "--window-text": "#000000",
    "--window-header-background": "#f8f8f8",
    "--window-header-text": "#333333",
    "--window-header-button-hover": "#e8e8e8",
    "--window-header-button-active": "#d8d8d8",
    "--window-resize-handle": "rgba(0, 0, 0, 0.1)",
    "--wm-btn-close-bg": "#ff5f57",
    "--wm-btn-minimize-bg": "#ffbd2e",
    "--wm-btn-maximize-bg": "#28c940",
    "--taskbar-bg": "rgba(248, 248, 248, 0.8)",
    "--text-primary": "#333333",
    "--accent-primary": "#0066cc"
  }
}
```

## Required Fields

The following fields are required:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier for your theme (alphanumeric, dashes, underscores) |
| `name` | Human-readable name of your theme |
| `version` | Semantic version (e.g., `1.0.0`) |
| `cssVariables` | Object containing all required CSS variables |
| `desktopBackground` | Background color or gradient for the desktop |

## Optional Fields

| Field | Description |
|-------|-------------|
| `author` | Your name or organization |
| `description` | Short description of your theme |
| `cssUrl` | URL to additional CSS for your theme |
| `preview` | URL to a preview image |
| `decoratorPath` | Path to custom window decorator JavaScript |
| `paddingConfig` | Configuration for padding (e.g., `{"windowContent": 16}`) |

## CSS Variables

Your theme must include the following CSS variables in the `cssVariables` object:

### Window Structure

- `--wm-border-width`: Width of window borders
- `--wm-border-color`: Color of window borders
- `--wm-border-radius`: Border radius for windows
- `--wm-header-height`: Height of window headers

### Colors

- `--window-background`: Background color for window content
- `--window-text`: Text color for window content
- `--window-header-background`: Background color for window headers
- `--window-header-text`: Text color for window headers
- `--window-header-button-hover`: Background color for header buttons when hovered
- `--window-header-button-active`: Background color for header buttons when active
- `--window-resize-handle`: Color for resize handles

### Control Buttons

- `--wm-btn-close-bg`: Background color for close button
- `--wm-btn-minimize-bg`: Background color for minimize button
- `--wm-btn-maximize-bg`: Background color for maximize button

### Theme-specific Variables

- `--taskbar-bg`: Background color for the taskbar
- `--text-primary`: Primary text color
- `--accent-primary`: Primary accent color

## Creating a Window Decorator (Optional)

For full customization, you can provide a decorator JavaScript module that renders custom window controls. Create a file at the path specified in `decoratorPath` with this structure:

```javascript
// Example: /themes/my-theme/decorator.js
class MyThemeDecorator {
  static Header = ({ title, onMinimize, onMaximize, onClose, headerRef }) => {
    return (
      <div ref={headerRef} className="my-theme-header">
        <div className="my-theme-title">{title}</div>
        <div className="my-theme-controls">
          <button onClick={onMinimize}>_</button>
          <button onClick={onMaximize}>□</button>
          <button onClick={onClose}>×</button>
        </div>
      </div>
    );
  };

  static Controls = ({ onMinimize, onMaximize, onClose }) => {
    return (
      <div className="my-theme-controls">
        <button onClick={onMinimize}>_</button>
        <button onClick={onMaximize}>□</button>
        <button onClick={onClose}>×</button>
      </div>
    );
  };

  static borderRadius = 8;
}

// Export as a global variable with the same name as your theme class
window.MyThemeDecorator = MyThemeDecorator;
```

## Publishing Your Theme

1. Host your theme files (manifest.json, CSS, decorator.js, etc.) on a web server
2. Share the URL to your manifest.json file with users
3. Users can install your theme by pasting the URL into the "Install Theme" dialog

## Testing Your Theme

1. Create a local copy of your theme files
2. Use a local web server to serve them
3. Install via the "Install Theme" dialog using the local URL

## Example Themes

Check out the following examples for inspiration:

- [Windows 10 Theme](/themes/win10/)
- [macOS Theme](/themes/macos/)
- [Ubuntu Theme](/themes/ubuntu/)

## Tips and Best Practices

- Test your theme on different screen sizes and color schemes
- Provide fallbacks for decorators in case they fail to load
- Use consistent color schemes and visual metaphors
- Consider accessibility by providing sufficient contrast
- Document any additional CSS classes or variables you define

## Need Help?

Join our community forum to get help with theme development and share your creations! 