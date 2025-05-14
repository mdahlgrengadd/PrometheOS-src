/**
 * Win7 Theme Decorator Loader
 * ==========================
 * This module dynamically loads either the advanced or simple decorator implementation
 * for the Windows 7 theme. It provides fallback mechanisms and detailed logging
 * to assist with debugging and troubleshooting.
 *
 * @file decorator.js
 * @module Win7Decorator
 */

// Configuration
const DECORATOR_PATHS = {
  ADVANCED: "./decorator_full_advanced_example.js",
  SIMPLE: "./decorator_full_simple_example.js",
};

// Module state
let decoratorModule = null;

/**
 * Attempts to load the advanced decorator implementation
 * @returns {Promise<Object|null>} The loaded decorator or null if failed
 */
async function loadAdvancedDecorator() {
  console.debug("[Win7 Decorator] Attempting to import advanced decorator...");

  try {
    const module = await import(DECORATOR_PATHS.ADVANCED);

    if (module && module.default) {
      console.info("[Win7 Decorator] Advanced decorator loaded successfully");
      return module.default;
    } else {
      console.warn(
        "[Win7 Decorator] Advanced decorator missing default export"
      );
      throw new Error("Advanced decorator did not export default");
    }
  } catch (error) {
    console.warn("[Win7 Decorator] Failed to load advanced decorator:", error);
    return null;
  }
}

/**
 * Attempts to load the simple decorator implementation
 * @returns {Promise<Object|null>} The loaded decorator or null if failed
 */
async function loadSimpleDecorator() {
  console.debug("[Win7 Decorator] Attempting to import simple decorator...");

  try {
    const module = await import(DECORATOR_PATHS.SIMPLE);

    if (module && module.default) {
      console.info("[Win7 Decorator] Simple decorator loaded successfully");
      return module.default;
    } else {
      console.error("[Win7 Decorator] Simple decorator missing default export");
      throw new Error("Simple decorator did not export default");
    }
  } catch (error) {
    console.error("[Win7 Decorator] Failed to load simple decorator:", error);
    return null;
  }
}

/**
 * Main decorator loading function. First tries the advanced decorator,
 * then falls back to the simple one if needed.
 *
 * @returns {Promise<Object|null>} The loaded decorator module or null if none found
 */
async function loadDecorator() {
  console.debug("[Win7 Decorator] Starting decorator load process...");

  // First try loading the advanced decorator
  const advancedDecorator = await loadAdvancedDecorator();

  if (advancedDecorator) {
    window.Win7Decorator = advancedDecorator;
    return advancedDecorator;
  }

  // Fallback: try loading the simple decorator
  const simpleDecorator = await loadSimpleDecorator();

  if (simpleDecorator) {
    window.Win7Decorator = simpleDecorator;
    return simpleDecorator;
  }

  // No decorator could be loaded
  console.error("[Win7 Decorator] Failed to load any decorator!");
  window.Win7Decorator = null;
  return null;
}

/**
 * Initialize the decorator loading process
 * This creates a promise that will resolve to the appropriate decorator
 * implementation once loaded.
 */
const decoratorPromise = loadDecorator();

// Export the promise that will resolve to the decorator
export default decoratorPromise;
