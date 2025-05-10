Here’s a **roadmap plan** to unify `WindowShell` and `WindowsWindow`, preserve complex theming, and introduce the flexible `data-draggable` feature. The plan is divided into phases and sprints for clarity and incremental progress.

---

## **Phase 1: Audit & Preparation**

### **Sprint 1: Audit and Documentation**
- **Inventory all features** in `WindowShell` and `WindowsWindow`.
- **Document all theme-specific logic** (especially for Windows themes).
- **List all props and behaviors** that differ between the two components.
- **Identify all drag/resize logic** and how it’s currently enforced.

---

## **Phase 2: Refactor for Extensibility**

### **Sprint 2: Abstract Advanced Features**
- Move all advanced/Windows-specific logic from `WindowsWindow` into `WindowShell` as optional props or hooks.
- Refactor `WindowShell` to accept configuration for:
  - Drag/resize behaviors
  - Controls position and style
  - Active/focus state logic
  - Theming hooks or decorators

### **Sprint 3: Introduce `data-draggable` Mechanism**
- Implement a unified drag handler in `WindowShell` that starts drag on any element with `data-draggable`.
- Mark the titlebar with `data-draggable` by default.
- Allow themes or parent components to mark additional areas as draggable.
- Ensure interactive elements (buttons, inputs) do not get `data-draggable`.

---

## **Phase 3: Theming and Backward Compatibility**

### **Sprint 4: Theme Integration**
- Refactor theme decorators to use the new unified `WindowShell`.
- Ensure all Windows theme quirks are preserved via props/configuration.
- Test all themes for visual and behavioral parity.

### **Sprint 5: Remove Redundancy**
- Remove `WindowsWindow` and update all usages to the unified `WindowShell`.
- Update documentation and usage examples.
- Refactor tests to use the new component.

---

## **Phase 4: Polish and Release**

### **Sprint 6: QA, Docs, and Release**
- Comprehensive QA: test all themes, drag/resize, and edge cases.
- Update developer documentation to explain new props and `data-draggable` usage.
- Announce and release the unified window component.

---

### **Summary Table**

| Phase | Sprint | Goal |
|-------|--------|------|
| 1     | 1      | Audit features, document differences |
| 2     | 2      | Move advanced logic to `WindowShell` as props |
| 2     | 3      | Implement `data-draggable` drag logic |
| 3     | 4      | Integrate and test all themes |
| 3     | 5      | Remove `WindowsWindow`, update usages |
| 4     | 6      | QA, docs, and release |

---

**Key Principles:**  
- Preserve all complex theming and behaviors.
- Make drag areas flexible and theme-configurable.
- Reduce code duplication and improve maintainability.

Let me know if you want a more detailed breakdown for any sprint!