/**
 * Amiga Workbench Theme Window Decorator
 * This decorator adds Amiga Workbench specific styling and behavior to windows
 */

class AmigaDecorator {
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  /**
   * Apply Amiga Workbench specific decorations to a window
   * @param {HTMLElement} windowElement - The window DOM element
   * @param {Object} windowConfig - Window configuration
   */
  decorateWindow(windowElement, windowConfig) {
    // Add Amiga class
    windowElement.classList.add("amiga-window");

    // Get header and controls
    const header = windowElement.querySelector(".window-header");
    const controls = windowElement.querySelector(".window-controls");

    // Clear existing controls
    if (controls) {
      controls.innerHTML = "";

      // Create Amiga Workbench style buttons (right to left)
      if (windowConfig.closable !== false) {
        const closeBtn = this.createButton("close", "");
        controls.appendChild(closeBtn);
      }

      if (windowConfig.maximizable !== false) {
        const maximizeBtn = this.createButton("maximize", "");
        controls.appendChild(maximizeBtn);
      }

      if (windowConfig.minimizable !== false) {
        const minimizeBtn = this.createButton("minimize", "");
        controls.appendChild(minimizeBtn);
      }
    }

    // Add window icon if specified (depth gadget)
    if (windowConfig.icon && header) {
      const iconElement = document.createElement("div");
      iconElement.className = "window-depth-gadget";
      iconElement.style.backgroundImage = `url(${windowConfig.icon})`;
      iconElement.style.width = "16px";
      iconElement.style.height = "16px";
      iconElement.style.marginRight = "4px";
      iconElement.style.cursor = "pointer";

      // Add depth behavior (bring to front on click)
      iconElement.addEventListener("click", () => {
        if (this.windowManager) {
          this.windowManager.bringToFront(windowElement.id);
        }
      });

      const title = header.querySelector(".window-title");
      if (title) {
        header.insertBefore(iconElement, title);
      }
    }

    // Add resize gadget to bottom right
    const resizeGadget = document.createElement("div");
    resizeGadget.className = "amiga-resize-gadget";
    resizeGadget.style.position = "absolute";
    resizeGadget.style.right = "0";
    resizeGadget.style.bottom = "0";
    resizeGadget.style.width = "16px";
    resizeGadget.style.height = "16px";
    resizeGadget.style.backgroundImage = "url(/themes/amiga/resize.png)";
    resizeGadget.style.cursor = "nwse-resize";

    windowElement.appendChild(resizeGadget);

    return windowElement;
  }

  /**
   * Create an Amiga Workbench style button
   * @param {string} action - Button action (minimize, maximize, close)
   * @param {string} label - Button label (usually empty for Amiga)
   * @returns {HTMLElement}
   */
  createButton(action, label) {
    const button = document.createElement("button");
    button.className = `window-button window-${action}`;
    button.dataset.action = action;
    button.innerHTML = label;
    button.style.cursor = "pointer";

    return button;
  }

  /**
   * Decorate the taskbar/dock with Amiga Workbench styling
   * @param {HTMLElement} taskbarElement - The taskbar DOM element
   */
  decorateTaskbar(taskbarElement) {
    taskbarElement.classList.add("amiga-taskbar");

    // Create Workbench Menu Button
    const menuButton = document.createElement("button");
    menuButton.className = "amiga-menu-button";
    menuButton.textContent = "Workbench";

    // Insert at beginning of taskbar
    if (taskbarElement.firstChild) {
      taskbarElement.insertBefore(menuButton, taskbarElement.firstChild);
    } else {
      taskbarElement.appendChild(menuButton);
    }

    // Add clock to right side
    const clockElement = document.createElement("div");
    clockElement.className = "amiga-clock";
    clockElement.style.marginLeft = "auto";
    clockElement.style.fontSize = "11px";
    clockElement.style.textTransform = "uppercase";

    // Update clock
    const updateClock = () => {
      const now = new Date();
      clockElement.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    updateClock();
    setInterval(updateClock, 60000);

    taskbarElement.appendChild(clockElement);
  }

  /**
   * Create desktop icon in Amiga Workbench style
   * @param {Object} iconConfig - Icon configuration
   * @returns {HTMLElement}
   */
  createDesktopIcon(iconConfig) {
    const iconElement = document.createElement("div");
    iconElement.className = "amiga-desktop-icon";

    const iconImage = document.createElement("div");
    iconImage.className = "icon-image";
    iconImage.style.backgroundImage = `url(${iconConfig.icon})`;

    const iconLabel = document.createElement("div");
    iconLabel.className = "icon-label";
    iconLabel.textContent = iconConfig.label;

    iconElement.appendChild(iconImage);
    iconElement.appendChild(iconLabel);

    // Add selection behavior
    iconElement.addEventListener("click", () => {
      // Deselect other icons
      document
        .querySelectorAll(".amiga-desktop-icon.selected")
        .forEach((icon) => {
          if (icon !== iconElement) {
            icon.classList.remove("selected");
          }
        });

      iconElement.classList.toggle("selected");
    });

    return iconElement;
  }

  /**
   * Create an Amiga Workbench style gadget (button)
   * @param {string} label - Gadget label
   * @returns {HTMLElement}
   */
  createGadget(label) {
    const gadget = document.createElement("button");
    gadget.className = "amiga-gadget";
    gadget.textContent = label;
    return gadget;
  }
}

// Export for ESM compatibility
export default AmigaDecorator;

// Make available globally for script tag loading
window.AmigaDecorator = AmigaDecorator;
