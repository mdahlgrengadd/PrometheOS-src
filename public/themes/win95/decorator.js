/**
 * Windows 95 Theme Window Decorator
 * This decorator adds Windows 95 specific styling and behavior to windows
 */

class Win95Decorator {
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  /**
   * Apply Windows 95 specific decorations to a window
   * @param {HTMLElement} windowElement - The window DOM element
   * @param {Object} windowConfig - Window configuration
   */
  decorateWindow(windowElement, windowConfig) {
    // Add Win95 class
    windowElement.classList.add("win95-window");

    // Get header and controls
    const header = windowElement.querySelector(".window-header");
    const controls = windowElement.querySelector(".window-controls");

    // Clear existing controls
    if (controls) {
      controls.innerHTML = "";

      // Create Windows 95 style buttons
      if (windowConfig.minimizable !== false) {
        const minimizeBtn = this.createButton("minimize", "_");
        controls.appendChild(minimizeBtn);
      }

      if (windowConfig.maximizable !== false) {
        const maximizeBtn = this.createButton("maximize", "□");
        controls.appendChild(maximizeBtn);
      }

      if (windowConfig.closable !== false) {
        const closeBtn = this.createButton("close", "X");
        controls.appendChild(closeBtn);
      }
    }

    // Add window icon if specified
    if (windowConfig.icon && header) {
      const iconElement = document.createElement("div");
      iconElement.className = "window-icon";
      iconElement.style.backgroundImage = `url(${windowConfig.icon})`;
      iconElement.style.width = "16px";
      iconElement.style.height = "16px";
      iconElement.style.marginRight = "4px";

      const title = header.querySelector(".window-title");
      if (title) {
        header.insertBefore(iconElement, title);
      }
    }

    return windowElement;
  }

  /**
   * Create a Windows 95 style button
   * @param {string} action - Button action (minimize, maximize, close)
   * @param {string} label - Button label
   * @returns {HTMLElement}
   */
  createButton(action, label) {
    const button = document.createElement("button");
    button.className = `window-button window-${action}`;
    button.dataset.action = action;
    button.innerHTML = label;
    button.style.fontFamily = "Arial";
    button.style.fontSize = "9px";
    button.style.fontWeight = "bold";
    button.style.lineHeight = "14px";
    button.style.textAlign = "center";
    button.style.cursor = "pointer";

    return button;
  }

  /**
   * Decorate the taskbar with Windows 95 styling
   * @param {HTMLElement} taskbarElement - The taskbar DOM element
   */
  decorateTaskbar(taskbarElement) {
    taskbarElement.classList.add("win95-taskbar");

    // Create Start Button
    const startButton = document.createElement("button");
    startButton.className = "win95-start-button";
    startButton.innerHTML =
      '<img src="/themes/win95/start-icon.png" style="width: 16px; height: 16px; margin-right: 4px;">Start';

    // Insert at beginning of taskbar
    if (taskbarElement.firstChild) {
      taskbarElement.insertBefore(startButton, taskbarElement.firstChild);
    } else {
      taskbarElement.appendChild(startButton);
    }
  }

  /**
   * Create desktop icon in Windows 95 style
   * @param {Object} iconConfig - Icon configuration
   * @returns {HTMLElement}
   */
  createDesktopIcon(iconConfig) {
    const iconElement = document.createElement("div");
    iconElement.className = "win95-desktop-icon";

    const iconImage = document.createElement("div");
    iconImage.className = "icon-image";
    iconImage.style.backgroundImage = `url(${iconConfig.icon})`;

    const iconLabel = document.createElement("div");
    iconLabel.className = "icon-label";
    iconLabel.textContent = iconConfig.label;

    iconElement.appendChild(iconImage);
    iconElement.appendChild(iconLabel);

    return iconElement;
  }
}

// Export for ESM compatibility
export default Win95Decorator;

// Make available globally for script tag loading
window.Win95Decorator = Win95Decorator;
