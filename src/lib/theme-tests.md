# Theme System Manual Testing

## Overview
This document outlines manual testing procedures for the theme system. These tests should be performed before merging theme-related changes.

## 1. Built-in Theme Tests

### Basic Theme Switching
1. Open the application
2. Use the theme selector dropdown to cycle through all built-in themes (Light, Dark, BeOS, Windows, macOS, Fluxbox)
3. Verify each theme loads correctly with its specific:
   - Window header style
   - Control buttons style and position
   - Background color/image
   - Border style
   - Color scheme

### Window Behavior with Different Themes
1. Open multiple windows
2. For each theme:
   - Drag windows to verify smooth movement
   - Resize windows to verify proper resize handling
   - Maximize and restore windows to verify correct position/size restoration
   - Verify windows can't be dragged completely off-screen

### Edge Cases
1. Rapidly switch between themes to verify no UI glitches
2. Switch themes while dragging a window
3. Switch themes while a window is being resized
4. Switch themes while a window is maximized
5. Verify correct theme persists after browser refresh

## 2. External Theme Tests

### Theme Loading
1. Open the application
2. Click on an external theme in the selector
3. Verify loading indicator appears
4. Verify theme loads and applies correctly
5. Verify browser refresh maintains the loaded theme

### Error Handling
1. Modify a theme manifest to include invalid data
2. Attempt to load the invalid theme
3. Verify error toast appears
4. Verify application falls back to previous theme
5. Verify UI remains functional

### Network Failures
1. Disable network connection
2. Attempt to load an external theme
3. Verify timeout/error handling works as expected
4. Verify fallback to previous theme

## 3. Accessibility Testing

### Keyboard Navigation
1. Use Tab key to focus on theme selector
2. Use arrow keys to navigate through options
3. Verify selected theme is announced by screen readers

### Screen Reader Testing
1. Test with common screen readers (NVDA, VoiceOver)
2. Verify theme selector and error states are properly announced

## 4. Performance Testing

### CSS Variables
1. Open browser developer tools
2. Inspect CSS variables on window elements
3. Verify theme CSS variables are correctly applied
4. Verify no unnecessary recalculations during theme changes

### Rendering Performance
1. Use browser performance tools to record frame rate during theme changes
2. Verify no significant frame drops during animations with any theme

## Recommended Testing Environments
- Latest Chrome
- Latest Firefox
- Latest Safari
- Mobile browsers (iOS Safari, Chrome for Android)
- Windows 10/11
- macOS 