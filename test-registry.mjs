import fs from 'fs/promises';
import path from 'path';

async function testRegistryRead() {
  try {
    const registryPath = path.resolve('src/plugins/registry.tsx');
    console.log('Reading registry from:', registryPath);
    
    const content = await fs.readFile(registryPath, 'utf8');
    console.log('Registry file size:', content.length, 'characters');
    
    // Look for manifest imports
    const manifestImports = content.match(/import { manifest as \w+Manifest } from ["']\.\/apps\/([^"']+)\/manifest["']/g);
    console.log('Manifest imports found:', manifestImports?.length || 0);
    
    if (manifestImports) {
      const pluginIds = manifestImports.map(importLine => {
        const match = importLine.match(/\.\/apps\/([^"']+)\/manifest/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.log('Plugin IDs:', pluginIds);
      console.log('ZetaWriter included:', pluginIds.includes('zetawriter'));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRegistryRead();
