# Webamp Plugin for Dreamscape

This plugin integrates the [Webamp](https://webamp.org/) music player (a Winamp clone for the web) with the Dreamscape desktop environment.

## Features

- Classic Winamp UI with skins support
- Audio playback with visualizations
- Drag and drop audio files 
- Playlist support
- Integration with Dreamscape's plugin system
- Comprehensive event-based API
- Proper window sync with Dreamscape

## Usage

1. Open the Webamp plugin from the desktop
2. Drag and drop audio files directly to the player window
3. Use the classic Winamp controls to play, pause, and navigate tracks

## API

The plugin exposes the following event methods through Dreamscape's event bus system:

```js
// Playback Control
// ----------------
// Play the current track
eventBus.emit('webamp:play');

// Pause playback
eventBus.emit('webamp:pause');

// Stop playback
eventBus.emit('webamp:stop');

// Next track in playlist
eventBus.emit('webamp:next');

// Previous track in playlist
eventBus.emit('webamp:prev');

// Track Loading
// ------------
// Load and play a track from URL
eventBus.emit('webamp:loadTrack', 'https://example.com/music.mp3', 'Title', 'Artist');

// Events Emitted
// -------------
// Listen for track change
eventBus.subscribe('webamp:trackChanged', (track, artist, title) => {
  console.log(`Now playing: ${artist} - ${title}`);
});
```

## Implementation Details

### Window State Sync

The plugin properly syncs window state between Webamp's own controls and the Dreamscape window manager:
- Clicking Winamp's close button will close the Dreamscape window
- Clicking Winamp's minimize button will minimize the Dreamscape window

### Optimizations

- CSS is preloaded to prevent Flash of Unstyled Content (FOUC)
- Track updates happen without recreating the Webamp instance
- All event listeners are properly cleaned up on component unmount
- Efficient drag & drop handling

## Future Enhancements

- Add VFS integration to load/save files from the Dreamscape virtual file system
- Support for playlists (.m3u, .pls)
- Enhanced Milkdrop visualization support
- Better window positioning and size persistence
- Advanced skin support and management

## Credits

- Original Webamp library by [Jordan Eldredge](https://github.com/captbaritone/webamp)
- Adapted from the daedalOS implementation 