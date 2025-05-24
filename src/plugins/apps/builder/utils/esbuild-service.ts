
import * as esbuild from 'esbuild-wasm';

let isInitialized = false;

interface BuildOptions {
  entryPoint: string; 
  content: string;
  options: {
    bundle?: boolean;
    minify?: boolean;
    format?: 'esm' | 'cjs' | 'iife';
    target?: string;
  };
}

export const initializeEsbuild = async () => {
  if (!isInitialized) {
    try {
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.18.7/esbuild.wasm',
      });
      isInitialized = true;
      console.log('ESBuild initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ESBuild:', error);
      throw error;
    }
  }
  return isInitialized;
};

export const buildCode = async ({ entryPoint, content, options }: BuildOptions) => {
  if (!isInitialized) {
    await initializeEsbuild();
  }

  try {
    // Create a virtual file system plugin
    const virtualFileSystemPlugin = {
      name: 'virtual-file-system',
      setup(build: esbuild.PluginBuild) {
        // Capture the entry point and provide the content
        build.onResolve({ filter: /.*/ }, (args) => {
          if (args.path === entryPoint) {
            return { path: args.path, namespace: 'virtual-fs' };
          }
          
          // For imports/requires in the file
          if (args.namespace === 'virtual-fs') {
            return { 
              path: new URL(args.path, `https://unpkg.com/${args.path}`).href,
              namespace: 'http-url',
            };
          }
          
          return null;
        });
        
        // Load the entry file from our virtual fs
        build.onLoad({ filter: /.*/, namespace: 'virtual-fs' }, async (args) => {
          return {
            contents: content,
            loader: entryPoint.endsWith('.jsx') || entryPoint.endsWith('.tsx') ? 'jsx' : 'js',
          };
        });
        
        // Load imported files from unpkg
        build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
          try {
            const response = await fetch(args.path);
            const fileContent = await response.text();
            
            let loader: esbuild.Loader = 'js';
            if (args.path.endsWith('.jsx') || args.path.endsWith('.tsx')) {
              loader = 'jsx';
            } else if (args.path.endsWith('.css')) {
              loader = 'css';
            } else if (args.path.endsWith('.json')) {
              loader = 'json';
            } else if (args.path.endsWith('.txt')) {
              loader = 'text';
            }
                          
            return {
              contents: fileContent,
              loader,
            };
          } catch (error) {
            console.error(`Failed to load ${args.path}:`, error);
            return {
              errors: [{ text: `Failed to load ${args.path}: ${error}` }],
            };
          }
        });
      },
    };

    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: options.bundle !== undefined ? options.bundle : true,
      minify: options.minify !== undefined ? options.minify : false,
      format: options.format || 'iife',
      target: options.target || 'es2015',
      write: false,
      plugins: [virtualFileSystemPlugin],
    });

    return {
      code: result.outputFiles ? result.outputFiles[0].text : '',
      error: null,
    };
  } catch (error) {
    console.error('Build failed:', error);
    return {
      code: '',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const parseEsbuildCommand = (command: string): BuildOptions | null => {
  try {
    // Example command: esbuild app.jsx --bundle --outfile=bundle.js
    const parts = command.split(' ');
    
    if (parts[0] !== 'esbuild') return null;
    
    const entryPoint = parts[1];
    
    // Default options
    const options: BuildOptions['options'] = {
      bundle: false,
      minify: false,
      format: 'iife',
    };
    
    // Parse flags
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '--bundle') {
        options.bundle = true;
      } else if (part === '--minify') {
        options.minify = true;
      } else if (part.startsWith('--format=')) {
        const format = part.split('=')[1] as 'esm' | 'cjs' | 'iife';
        options.format = format;
      } else if (part.startsWith('--target=')) {
        options.target = part.split('=')[1];
      }
      // We ignore --outfile since we're handling output differently
    }
    
    // We'll need to get the actual content from our file system
    return { entryPoint, content: '', options };
  } catch (error) {
    console.error('Failed to parse esbuild command:', error);
    return null;
  }
};
