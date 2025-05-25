import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';
import { Plugin } from 'vite';

const SHADOW_DIR = path.resolve(process.cwd(), "public/shadow");

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
  return {
    name: "vite-plugin-shadowfs",
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.endsWith("shadow-manifest.json")) {
          // Scan the shadow dir
          const files = await fg(["**/*"], {
            cwd: SHADOW_DIR,
            dot: true,
            onlyFiles: true,
          });
          const items: ShadowFsItem[] = [];
          for (const file of files) {
            items.push(fileToFsItem(path.join(SHADOW_DIR, file), SHADOW_DIR));
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(items));
          return;
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
      const items = files.map((file) =>
        fileToFsItem(path.join(SHADOW_DIR, file), SHADOW_DIR)
      );

      // 3. Emit it as an asset so it ends up in dist/
      this.emitFile({
        type: "asset",
        fileName: "shadow-manifest.json", // will be /shadow-manifest.json at runtime
        source: JSON.stringify(items),
      });
    },
  };
}
