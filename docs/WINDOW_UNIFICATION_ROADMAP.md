# Unified Window System Roadmap

This document outlines the remaining work to fully unify the window components in Draggable Desktop Dreamscape.

## Current Status (Phase 2, Sprint 3)

- ✅ Created `UnifiedWindowShell` component with all advanced features
- ✅ Updated `WindowShell` to delegate to `UnifiedWindowShell` for non-Windows themes
- ✅ Implemented data-draggable mechanism for flexible drag areas
- ✅ Updated `WindowHeader` to support data-draggable
- ✅ Created CSS styles for unified windows
- ✅ Added documentation

## Remaining Work

### Phase 3: Theming and Backward Compatibility (Sprint 4)

1. **Theme Decorator Integration**
   - Update all theme decorators to use data-draggable
   - Ensure Windows theme decorators work with UnifiedWindowShell
   - Test all themes for visual and behavioral parity

2. **Fully Test with All Themes**
   - Test theme-specific quirks (BeOS header behavior, etc.)
   - Ensure all themes maintain their visual identity
   - Verify active state behavior is preserved for different themes

### Phase 3: Remove Redundancy (Sprint 5)

1. **Remove WindowsWindow**
   - Update WindowShell to use UnifiedWindowShell for all themes
   - Remove the WindowsWindow component
   - Update all imports and references

2. **Update Tests**
   - Update all tests to use the new unified window components
   - Add tests for data-draggable functionality
   - Verify all edge cases are covered

### Phase 4: Polish and Release (Sprint 6)

1. **Comprehensive QA**
   - Test all themes for visual fidelity
   - Test drag/resize behavior in edge cases
   - Test focus and active state behavior
   - Test window controls (minimize, maximize, close)

2. **Documentation**
   - Update developer documentation with examples
   - Document any remaining theme-specific behaviors
   - Create examples for custom drag handles

3. **Release**
   - Announce the unified window system
   - Update examples in the codebase
   - Finalize documentation

## Timeline

- **Sprint 4 (Theme Integration)**: 1 week
- **Sprint 5 (Remove Redundancy)**: 1 week
- **Sprint 6 (Polish and Release)**: 1 week

## Future Enhancements

- Advanced resize controls with aspect ratio locking
- Snapping to grid or other windows
- Multi-monitor support
- Additional window animations
