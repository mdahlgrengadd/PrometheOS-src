# URL-Based App Launching

This feature allows you to launch apps directly via URL, making it easy to bookmark specific apps or share links that open directly to an application.

## Direct App Launch URLs

You can launch a specific app using a URL in this format:

```
http://localhost:8080/apps/wordeditor
```

This will automatically open the desktop with the Word Editor app launched.

## App IDs

Here are the app IDs you can use in URLs:

- `wordeditor` - Word Editor
- `notepad` - Notepad
- `calculator` - Calculator
- `browser` - Web Browser
- `settings` - Settings
- `audioplayer` - Audio Player
- `webllm-chat` - WebLLM Chat
- `api-explorer` - API Explorer
- `api-flow-editor` - API Flow Editor
- `filebrowser` - File Browser

## Multiple Apps in URL

You can also open multiple apps at once using the query string format:

```
http://localhost:8080/?open=wordeditor,calculator,browser
```

This will open all three apps simultaneously on desktop. On mobile, only the first app (wordeditor) will be launched due to the single-app nature of the mobile interface.

## Mobile Support

When accessing URLs with app parameters on mobile devices:

- Direct app URLs like `/apps/calculator` will open the calculator app in mobile view
- Multiple app URLs with query parameters like `/?open=notepad,browser` will open only the first app (notepad) in the list
- The mobile interface will display the app in full-screen mobile-optimized mode

## Features

1. **Bookmarkable URLs** - Save frequently used app configurations as browser bookmarks
2. **Shareable Links** - Share links with others to open specific apps
3. **App State in URL** - Browser history tracks your open apps
4. **Back/Forward Navigation** - Use browser back/forward buttons to navigate between app states
5. **Responsive Design** - Works on both desktop and mobile interfaces

## Copy Launch URL

Right-click on any desktop icon to access a context menu where you can copy the direct launch URL for that app.

## Technical Implementation

The system uses React Router to handle the URL-based app launching. When a URL with `/apps/:appId` is visited, the system:

1. Navigates to the main interface (desktop or mobile)
2. Automatically launches the specified app(s)
   - On desktop: All specified apps are opened
   - On mobile: Only the first app is opened

For query string parameters (`?open=app1,app2`), the interface parses the parameters and opens the specified apps on initial load, adapting to the device type.

The current set of open apps is always synchronized with the URL on desktop, allowing browser history to work seamlessly with the application state. 