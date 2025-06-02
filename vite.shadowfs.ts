import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';
import { Plugin } from 'vite';

const SHADOW_DIR = path.resolve(process.cwd(), "public/shadow");
const DIST_SHADOW_DIR = path.resolve(process.cwd(), "dist/shadow");

interface ShadowFsItem {
  id: string;
  name: string;
  type: "file" | "folder";
  contentPath: string;
}

function fileToFsItem(filePath: string, root: string): ShadowFsItem {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  return {
    id: rel,
    name: path.basename(filePath),
    type: "file",
    contentPath: `/shadow/${rel}`,
    // Optionally: language: ... (infer from extension)
  };
}

export default function shadowFsPlugin(): Plugin {
  let baseUrl = "/";
  
  return {
    name: "vite-plugin-shadowfs",
    configResolved(config) {
      // Store the base URL from config
      baseUrl = config.base || "/";
      console.log(`[shadowfs] Base URL set to: ${baseUrl}`);
    },
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle shadow-manifest.json requests (with or without base URL)
        if (req.url?.endsWith("shadow-manifest.json")) {
          // Scan both public/shadow and dist/shadow for files
          const publicFiles = await fg(["**/*"], {
            cwd: SHADOW_DIR,
            dot: true,
            onlyFiles: true,
          }).catch(() => []);

          const distFiles = await fg(["**/*"], {
            cwd: DIST_SHADOW_DIR,
            dot: true,
            onlyFiles: true,
          }).catch(() => []);

          const items: ShadowFsItem[] = [];
          
          // Add files from public/shadow
          for (const file of publicFiles) {
            const item = fileToFsItem(path.join(SHADOW_DIR, file), SHADOW_DIR);
            // Update contentPath to include base URL
            item.contentPath = `${baseUrl.replace(/\/$/, '')}/shadow/${item.id}`;
            items.push(item);
          }
          
          // Add files from dist/shadow (mainly node_modules)
          for (const file of distFiles) {
            const item = fileToFsItem(path.join(DIST_SHADOW_DIR, file), DIST_SHADOW_DIR);
            // Update contentPath to include base URL
            item.contentPath = `${baseUrl.replace(/\/$/, '')}/shadow/${item.id}`;
            items.push(item);
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(items));
          return;
        }

        // Serve files from dist/shadow if they exist (for node_modules during dev)
        // Handle both /shadow/ and /prometheos/shadow/ paths
        const shadowPath = req.url?.startsWith('/shadow/') ? req.url : 
                          req.url?.startsWith(`${baseUrl}shadow/`) ? req.url.replace(baseUrl, '/') : null;
        
        if (shadowPath?.startsWith('/shadow/')) {
          const filePath = shadowPath.replace('/shadow/', '');
          const distShadowPath = path.join(DIST_SHADOW_DIR, filePath);
          
          try {
            const stat = await fs.stat(distShadowPath);
            if (stat.isFile()) {
              const content = await fs.readFile(distShadowPath);
              // Set appropriate content-type based on file extension
              if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
              } else if (filePath.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(content);
              return;
            }
          } catch (error) {
            // File doesn't exist in dist/shadow, continue to next middleware
          }
        }

        next();
      });
    },

    // Run during `vite build`
    async generateBundle() {
      // 1. Scan every file under public/shadow
      const files = await fg(["**/*"], {
        cwd: SHADOW_DIR,
        dot: true,
        onlyFiles: true,
      });

      // 2. Build the same manifest array we returned in dev
      const items = files.map((file) => {
        const item = fileToFsItem(path.join(SHADOW_DIR, file), SHADOW_DIR);
        // Update contentPath to include base URL for production
        item.contentPath = `${baseUrl.replace(/\/$/, '')}/shadow/${item.id}`;
        console.log(`[shadowfs] Generated contentPath: ${item.contentPath} (baseUrl: ${baseUrl})`);
        return item;
      });

      // 3. Emit it as an asset so it ends up in dist/
      this.emitFile({
        type: "asset",
        fileName: "shadow-manifest.json", // will be /shadow-manifest.json at runtime
        source: JSON.stringify(items),
      });
    },
  };
}
