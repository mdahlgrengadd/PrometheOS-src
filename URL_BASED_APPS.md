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

This will open all three apps simultaneously.

## Features

1. **Bookmarkable URLs** - Save frequently used app configurations as browser bookmarks
2. **Shareable Links** - Share links with others to open specific apps
3. **App State in URL** - Browser history tracks your open apps
4. **Back/Forward Navigation** - Use browser back/forward buttons to navigate between app states

## Copy Launch URL

Right-click on any desktop icon to access a context menu where you can copy the direct launch URL for that app.

## Technical Implementation

The system uses React Router to handle the URL-based app launching. When a URL with `/apps/:appId` is visited, the system:

1. Navigates to the main desktop interface
2. Automatically launches the specified app

For query string parameters (`?open=app1,app2`), the desktop parses the parameters and opens the specified apps on initial load.

The current set of open apps is always synchronized with the URL, allowing browser history to work seamlessly with the application state. 