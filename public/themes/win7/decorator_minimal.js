// Win7 Decorator Loader
// Dynamically loads either the advanced or simple full example decorator implementation.
// Always sets window.Win7Decorator for compatibility.

let DecoratorModule = null;

async function loadDecorator() {
  try {
    // Try to import the advanced full example decorator (if it exists)
    DecoratorModule = await import("./decorator_full_advanced_example.js");
    if (DecoratorModule && DecoratorModule.default) {
      window.Win7Decorator = DecoratorModule.default;
      return DecoratorModule.default;
    } else {
      throw new Error("Advanced decorator did not export default");
    }
  } catch (e) {
    // Fallback: use the simple full example decorator
    const SimpleDecorator = await import("./decorator_full_simple_example.js");
    window.Win7Decorator = SimpleDecorator.default;
    return SimpleDecorator.default;
  }
}

// Immediately load and export the decorator
const decoratorPromise = loadDecorator();

export default decoratorPromise;
