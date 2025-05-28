#!/usr/bin/env node

/**
 * Copy Python modules to public directory for Pyodide access
 * This script copies the prometheos-client-python files to public/python-modules
 * so they can be fetched by Pyodide at runtime
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'src', 'prometheos-client-python');
const targetDir = path.join(__dirname, '..', 'public', 'python-modules');

console.log('🐍 Copying Python modules for Pyodide...');
console.log(`Source: ${sourceDir}`);
console.log(`Target: ${targetDir}`);

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('📁 Created target directory');
}

// Copy all .py files
function copyPythonFiles(src, dest) {
    const files = fs.readdirSync(src);
    
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            // Recursively copy directories
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            copyPythonFiles(srcPath, destPath);
        } else if (file.endsWith('.py')) {
            // Copy Python files
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied: ${file}`);
        }
    });
}

try {
    copyPythonFiles(sourceDir, targetDir);
    console.log('🎉 Python modules copied successfully!');
    console.log('💡 Pyodide can now fetch these modules from /prometheos/python-modules/');
} catch (error) {
    console.error('❌ Error copying Python modules:', error);
    process.exit(1);
}
