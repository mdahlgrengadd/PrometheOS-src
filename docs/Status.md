# Project Status: Desktop Dreamscape Systems Overview (May 2025)

This document provides an up-to-date overview of the designed systems in the Desktop Dreamscape project, their current implementation status, and how they interact. It is based on the latest source code and supersedes older documentation.

---

## 1. **Plugin System**

### **Architecture**
- **Plugins** are self-contained React modules implementing the `Plugin` interface (see `src/plugins/types.ts`).
- Each plugin has a `PluginManifest` (metadata, icon, entry, etc.).
- Plugins are loaded either statically (bundled) or dynamically (remote, via manifest URL).
- **Lifecycle:** Plugins support `init`, `render`, and optional window lifecycle methods (`onOpen`, `onClose`, etc.).
- **PluginManager** (`src/plugins/PluginManager.tsx`) manages registration, activation, deactivation, and unregistration of plugins.
- **Dynamic Plugins:** Remote plugins are installed via manifest URL, stored in localStorage, and loaded at runtime.
- **Worker Plugins:** Supported for compute-intensive tasks (see `WorkerPluginManagerClient`).
- **EventBus:** Decoupled event system for plugin/core communication.

### **Interaction**
- Plugins are rendered in windows managed by the window system.
- Plugins can expose API-enabled components for automation and AI control (see API System).

---

## 2. **Window System**

### **Architecture**
- **UnifiedWindowShellV2** (`src/components/shelley-wm/UnifiedWindowShellV2.tsx`):
  - Main window component for all non-Windows themes.
  - Handles drag, resize, focus, z-index, minimize/maximize, and window controls.
  - Implements the `data-draggable` mechanism: any element with `data-draggable="true"` is a drag handle.
  - Integrates with the window store (Zustand) for state management.
- **WindowShell** (`src/components/shelley-wm/WindowShell.tsx`):
  - Delegates to `WindowsWindow` for legacy Windows themes (win98, winxp, win7), otherwise uses `UnifiedWindowShellV2`.
  - Migration to full unification is in progress (see roadmap docs).
- **WindowHeader**: Supports theme decorators and custom headers, always applies `data-draggable` to the header.
- **WindowStore** (`src/store/windowStore.ts`): Zustand store for all window state, z-index, and actions.

### **Interaction**
- Windows host plugin UIs and system apps.
- Theming and decorator logic is respected for window chrome and controls.

---

## 3. **Theme System**

### **Architecture**
- **Themes** are defined by a manifest (JSON) and optional decorator JS module.
- **ThemeManager** and related components allow install/uninstall and switching of themes at runtime.
- **Decorator Modules:** ESM-only, loaded dynamically, must export a default decorator object (see `docs/ESM_THEME_MIGRATION.md`).
- **ThemeProvider** context manages active theme, variables, and decorator injection.
- **CSS Variables:** All theming is via CSS custom properties, set per theme.

### **Interaction**
- Window system reads theme variables and decorator for chrome, controls, and header rendering.
- Themes can be installed from local or remote sources.

---

## 4. **API System**

### **Architecture**
- **API-aware components** are registered using the `withApi` HOC or `useApiComponent` hook.
- **ApiContext** manages registration, state, and action handlers for all API components.
- **OpenAPI Spec:** System can generate OpenAPI docs for all registered components.
- **EventBus** is used for API action dispatch and result handling.

### **Interaction**
- Plugins and system apps can expose UI elements for automation, scripting, or AI control.
- API Explorer and Flow Editor are built-in plugins leveraging this system.

---

## 5. **Dynamic Loading & Extensibility**
- **Plugins** and **themes** can be installed at runtime from remote URLs.
- **Dynamic plugin registry** and **theme loader** manage persistence and hot-reloading.
- **Worker plugins** are supported for off-main-thread computation.

---

## 6. **Current Migration/Unification Status**
- **Window System:** Migration to `UnifiedWindowShellV2` is nearly complete; legacy WindowsWindow is still used for Windows themes but will be removed soon.
- **Theme Decorators:** All decorators must now be ESM-only and use export default (no global assignment).
- **API System:** Fully integrated; all new plugins and components should use API registration for automation.
- **Documentation:** Some docs are outdated; this file is the current source of truth for architecture and system interaction.

---

## 7. **Key Files & Entry Points**
- `src/plugins/types.ts` — Plugin and manifest interfaces
- `src/plugins/PluginManager.tsx` — Plugin lifecycle management
- `src/plugins/registry.tsx` — Static and dynamic plugin manifest registry
- `src/components/shelley-wm/UnifiedWindowShellV2.tsx` — Main window implementation
- `src/store/windowStore.ts` — Window state management
- `src/components/ThemeManager.tsx` — Theme management UI
- `src/api/hoc/withApi.tsx` — API component registration
- `src/api/context/ApiContext.tsx` — API system context

---

## 8. **See Also**
- `docs/ROADMAP.md`, `docs/WINDOW_UNIFICATION_ROADMAP.md`, `docs/ESM_THEME_MIGRATION.md` for migration plans and legacy notes.

---

*This document reflects the current state of the codebase as of May 2025. For up-to-date details, always refer to the source code.*
