import * as esbuild from 'esbuild-wasm';
import * as path from 'path-browserify';

let isInitialized = false;

// Add a module-level promise for initialization
let initializePromise: Promise<boolean> | null = null;

interface BuildOptions {
  entryPoint: string;
  content: string;
  options: {
    bundle?: boolean;
    minify?: boolean;
    format?: "esm" | "cjs" | "iife";
    target?: string;
    jsxFactory?: string;
    jsxFragment?: string;
    external?: string[];
  };
}

// Virtual file system for managing imported files
interface VirtualFile {
  contents: string;
  loader: esbuild.Loader;
}

const virtualFs: Record<string, VirtualFile> = {};

export const initializeEsbuild = async () => {
  if (!initializePromise) {
    initializePromise = esbuild
      .initialize({
        wasmURL: "https://unpkg.com/esbuild-wasm@0.18.7/esbuild.wasm",
      })
      .then(() => {
        isInitialized = true;
        console.log("ESBuild initialized successfully");
        return isInitialized;
      })
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.message.includes("initialize") &&
          error.message.includes("once")
        ) {
          console.warn(
            "ESBuild initialize called multiple times; suppressing error"
          );
          isInitialized = true;
          return isInitialized;
        }
        console.error("Failed to initialize ESBuild:", error);
        throw error;
      });
  }
  return initializePromise;
};

export const buildCode = async ({
  entryPoint,
  content,
  options,
}: BuildOptions) => {
  // Always ensure ESBuild is initialized before building
  await initializeEsbuild();

  try {
    // Store the entry file in our virtual filesystem
    virtualFs[entryPoint] = {
      contents: content,
      loader:
        entryPoint.endsWith(".jsx") || entryPoint.endsWith(".tsx")
          ? "jsx"
          : entryPoint.endsWith(".css")
          ? "css"
          : "js",
    };

    // CSS injection plugin - converts CSS imports to runtime style injection
    const cssInjectPlugin = {
      name: "css-inject",
      setup(build: esbuild.PluginBuild) {
        build.onLoad(
          { filter: /\.css$/, namespace: "virtual-fs" },
          async (args) => {
            console.log(
              "[css-inject] Handling",
              args.path,
              "in namespace",
              args.namespace
            );
            const cssFile = virtualFs[args.path];
            if (!cssFile) {
              throw new Error(
                `CSS file not found in virtual filesystem: ${args.path}`
              );
            }
            const css = cssFile.contents;
            const styleId = `injected-style-${args.path.replace(
              /[^a-zA-Z0-9]/g,
              "-"
            )}`;
            return {
              contents: `
              // CSS module: ${args.path}
              (function() {
                if (typeof document !== 'undefined') {
                  const existingStyle = document.getElementById('${styleId}');
                  if (existingStyle) existingStyle.remove();
                  const style = document.createElement('style');
                  style.id = '${styleId}';
                  style.textContent = ${JSON.stringify(css)};
                  document.head.appendChild(style);
                }
              })();
              export default {};
            `,
              loader: "js",
            };
          }
        );
      },
    };

    // Create a virtual file system plugin
    const virtualFileSystemPlugin = {
      name: "virtual-file-system",
      setup(build: esbuild.PluginBuild) {
        // 1. Catch your entry point by name and give it its own namespace
        build.onResolve({ filter: new RegExp(`^${entryPoint}$`) }, (args) => ({
          path: args.path,
          namespace: "virtual-fs",
        }));

        // 2. Relative imports inside your entry file ("./foo" or "../bar")
        build.onResolve(
          { filter: /^\.+\//, namespace: "virtual-fs" },
          (args) => {
            // Use path-browserify to resolve relative paths instead of URL
            const resolvedPath = path.posix.join(
              path.posix.dirname(args.importer),
              args.path
            );

            console.log(
              `Resolved ${args.path} from ${args.importer} to ${resolvedPath}`
            );

            // Keep CSS and other local files in the virtual-fs namespace
            if (resolvedPath.endsWith(".css") || virtualFs[resolvedPath]) {
              return {
                path: resolvedPath,
                namespace: "virtual-fs",
              };
            }

            // For other imports that we can't resolve locally, try HTTP
            return {
              path: `https://unpkg.com/${resolvedPath}`,
              namespace: "http-url",
            };
          }
        );

        // Bare imports resolution: prefer shadowed node_modules before CDN
        build.onResolve(
          { filter: /^[^./].*/, namespace: "virtual-fs" },
          (args) => {
            const pkgPath = args.path;
            // Try direct .js file (e.g. react-dom/client.js)
            const fileJs = `node_modules/${pkgPath}.js`;
            if (virtualFs[fileJs]) {
              return { path: fileJs, namespace: "virtual-fs" };
            }
            // Try package folder index.js (e.g. react/index.js or react-dom/client/index.js)
            const folderIndex = `node_modules/${pkgPath}/index.js`;
            if (virtualFs[folderIndex]) {
              return { path: folderIndex, namespace: "virtual-fs" };
            }
            // Fallback to CDN
            return {
              path: `https://unpkg.com/${pkgPath}`,
              namespace: "http-url",
            };
          }
        );

        // 4. Any imports inside HTTP-fetched modules (so nested `require('./cjs/…')`)
        build.onResolve({ filter: /.*/, namespace: "http-url" }, (args) => {
          // Bare import (e.g. "lodash") → fetch fresh from unpkg
          if (!args.path.startsWith(".") && !args.path.startsWith("/")) {
            return {
              path: `https://unpkg.com/${args.path}`,
              namespace: "http-url",
            };
          }

          // Relative import under the fetched file:
          // append a slash to importer so `new URL` keeps the package segment
          const base = args.importer.endsWith("/")
            ? args.importer
            : `${args.importer}/`;
          return {
            path: new URL(args.path, base).href,
            namespace: "http-url",
          };
        });

        // 5. Load files from the virtual filesystem
        build.onLoad(
          { filter: /.*/, namespace: "virtual-fs" },
          async (args) => {
            // Check if it's in our virtual filesystem
            if (virtualFs[args.path]) {
              return {
                contents: virtualFs[args.path].contents,
                loader: virtualFs[args.path].loader,
              };
            }

            // If it's the entry point
            if (args.path === entryPoint) {
              return {
                contents: content,
                loader:
                  entryPoint.endsWith(".jsx") || entryPoint.endsWith(".tsx")
                    ? "jsx"
                    : entryPoint.endsWith(".css")
                    ? "css"
                    : "js",
              };
            }

            // Check if it's a CSS file (that we might not have cached yet)
            if (args.path.endsWith(".css")) {
              // In a real implementation, you'd lookup the file in your filesystem
              // For now, report an error that the file wasn't found
              throw new Error(
                `CSS file not found: ${args.path}. Make sure to add it to the virtual filesystem.`
              );
            }

            // File not found in virtual filesystem
            throw new Error(
              `File not found in virtual filesystem: ${args.path}`
            );
          }
        );

        // 6. Fetch all HTTP modules and set resolveDir for further lookups
        build.onLoad({ filter: /.*/, namespace: "http-url" }, async (args) => {
          const response = await fetch(args.path);
          const text = await response.text();

          let loader: esbuild.Loader = "js";
          if (args.path.match(/\.(jsx|tsx)$/)) loader = "jsx";
          else if (args.path.endsWith(".css")) loader = "css";
          else if (args.path.endsWith(".json")) loader = "json";
          else if (args.path.endsWith(".txt")) loader = "text";

          return {
            contents: text,
            loader,
            // ensure further relative imports resolve beneath this URL
            resolveDir: args.path.replace(/\/[^/]+$/, "/"),
          };
        });
      },
    };

    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: options.bundle !== undefined ? options.bundle : true,
      minify: options.minify !== undefined ? options.minify : false,
      format: options.format || "iife",
      target: options.target || "es2015",
      jsxFactory: options.jsxFactory || "React.createElement",
      jsxFragment: options.jsxFragment || "React.Fragment",
      external: options.external || [],
      write: false,
      plugins: [cssInjectPlugin, virtualFileSystemPlugin],
      define: {
        "process.env.NODE_ENV": '"development"',
      },
    });

    return {
      code: result.outputFiles ? result.outputFiles[0].text : "",
      error: null,
    };
  } catch (error) {
    console.error("Build failed:", error);
    return {
      code: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// Helper function to add a file to the virtual filesystem
export const addToVirtualFs = (filePath: string, contents: string) => {
  let loader: esbuild.Loader = "js";
  if (filePath.match(/\.(jsx|tsx)$/)) loader = "jsx";
  else if (filePath.endsWith(".css")) loader = "css";
  else if (filePath.endsWith(".json")) loader = "json";
  else if (filePath.endsWith(".txt")) loader = "text";

  virtualFs[filePath] = { contents, loader };
};

export const parseEsbuildCommand = (command: string): BuildOptions | null => {
  try {
    // Example command: esbuild app.jsx --bundle --outfile=bundle.js
    const parts = command.split(" ");

    if (parts[0] !== "esbuild") return null;

    const entryPoint = parts[1];

    // Default options
    const options: BuildOptions["options"] = {
      bundle: false,
      minify: false,
      format: "iife",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
    };

    // Parse flags
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];

      if (part === "--bundle") {
        options.bundle = true;
      } else if (part === "--minify") {
        options.minify = true;
      } else if (part.startsWith("--format=")) {
        const format = part.split("=")[1] as "esm" | "cjs" | "iife";
        options.format = format;
      } else if (part.startsWith("--target=")) {
        options.target = part.split("=")[1];
      } else if (part.startsWith("--jsx-factory=")) {
        options.jsxFactory = part.split("=")[1];
      } else if (part.startsWith("--jsx-fragment=")) {
        options.jsxFragment = part.split("=")[1];
      } else if (part.startsWith("--external:")) {
        // Handle multiple external modules in the format: --external:react,react-dom
        const externalModules = part.split(":")[1].split(",");
        if (!options.external) options.external = [];
        options.external.push(...externalModules);
      }
      // We ignore --outfile since we're handling output differently
    }

    // We'll need to get the actual content from our file system
    return { entryPoint, content: "", options };
  } catch (error) {
    console.error("Failed to parse esbuild command:", error);
    return null;
  }
};
