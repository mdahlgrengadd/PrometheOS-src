# URL App Launch and Initialization Parameters

This project supports launching apps directly from the browser location bar using URL query parameters. You can open one or more apps and supply initialization data to each app using flexible URL schemes.

## Supported URL Formats

### 1. Open a Single App
```
?open=notepad
```

### 2. Open Multiple Apps
```
?open=notepad,audioplayer
```

### 3. Open a Single App with Initialization Data
You can provide initial content or configuration to an app using the `initFromUrl` parameter:
```
?open=notepad&initFromUrl=Hello%20World
```

#### Supported Initialization Data Schemes
- **Plain text:**
  - `?open=notepad&initFromUrl=Hello%20World`
- **HTTP/HTTPS URL:**
  - `?open=notepad&initFromUrl=https://example.com/data.txt`
- **Virtual File System (VFS):**
  - `?open=notepad&initFromUrl=vfs://documents/readme.txt`
- **Base64 Data (custom or standard):**
  - Custom: `?open=notepad&initFromUrl=data://base64,SGVsbG8gV29ybGQ=`
  - Standard: `?open=notepad&initFromUrl=data:text/plain;base64,SGVsbG8gV29ybGQ=`

### 4. Open Multiple Apps with Individual Initialization Data
You can provide separate initialization data for each app using the `<appId>_init` parameter:
```
?open=notepad,audioplayer&notepad_init=data:text/plain;base64,SGVsbG8gV29ybGQ=&audioplayer_init=https://example.com/audio.mp3
```

- Each app receives its own decoded and processed initialization data.
- Commas in data URLs are supported and will not break app parsing.

## Notes
- All initialization data is automatically URL-decoded and processed according to its scheme.
- Both custom (`data://base64,...`) and standard (`data:text/plain;base64,...`) data URLs are supported.
- If both `initFromUrl` and `<appId>_init` are present, `<appId>_init` takes precedence for that app.
- This works for both desktop and mobile views.

## Example URLs
- Open Notepad with plain text:
  - `?open=notepad&initFromUrl=Hello%20World`
- Open Notepad with base64 data:
  - `?open=notepad&initFromUrl=data:text/plain;base64,SGVsbG8gV29ybGQ=`
- Open Notepad and Audio Player, each with their own data:
  - `?open=notepad,audioplayer&notepad_init=data:text/plain;base64,SGVsbG8gV29ybGQ=&audioplayer_init=https://example.com/audio.mp3`

## Troubleshooting
- If your data contains special characters (like commas), always use URL encoding (e.g., `encodeURIComponent`).
- If you see unexpected results, check the browser's address bar for correct encoding and parameter structure.

---

For more details, see the implementation in `src/utils/url.ts` and the Notepad/URL-Test plugins.
