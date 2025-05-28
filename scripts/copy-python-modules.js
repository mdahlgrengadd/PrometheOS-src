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
const generatedSourceDir = path.join(__dirname, '..', 'src', 'prometheos-client-python-generated');
const targetDir = path.join(__dirname, '..', 'public', 'python-modules');

console.log('🐍 Copying Python modules for Pyodide...');
console.log(`Source: ${sourceDir}`);
console.log(`Generated Source: ${generatedSourceDir}`);
console.log(`Target: ${targetDir}`);

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('📁 Created target directory');
}

// Copy Python files and necessary support files
function copyPythonFiles(src, dest, excludeDirs = []) {
    const files = fs.readdirSync(src);
    
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            // Skip certain directories that aren't needed for runtime
            const defaultExcludes = ['.git', '.github', '__pycache__', '.pytest_cache', 'test', 'tests', 'docs', '.openapi-generator'];
            if (defaultExcludes.includes(file) || excludeDirs.includes(file)) {
                return;
            }
            
            // Recursively copy directories
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            copyPythonFiles(srcPath, destPath, excludeDirs);
        } else if (file.endsWith('.py') || file === '__init__.py' || file === 'py.typed') {
            // Copy Python files and typing files
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied: ${path.relative(src, srcPath)}`);
        }
    });
}

try {
    // Copy unified client files
    copyPythonFiles(sourceDir, targetDir);
    
    // Copy generated client files if they exist
    if (fs.existsSync(generatedSourceDir)) {
        const generatedClientDir = path.join(generatedSourceDir, 'prometheos_client');
        if (fs.existsSync(generatedClientDir)) {
            const generatedTargetDir = path.join(targetDir, 'prometheos_client_python_generated');
            console.log('📦 Copying generated client files...');
            if (!fs.existsSync(generatedTargetDir)) {
                fs.mkdirSync(generatedTargetDir, { recursive: true });
            }
            copyPythonFiles(generatedClientDir, generatedTargetDir);
        } else {
            console.log('⚠️  Generated client prometheos_client directory not found');
        }
    } else {
        console.log('⚠️  Generated client files not found. Run "npm run codegen" first.');
    }
    
    console.log('🎉 Python modules copied successfully!');
    console.log('💡 Pyodide can now fetch these modules from /prometheos/python-modules/');
} catch (error) {
    console.error('❌ Error copying Python modules:', error);
    process.exit(1);
}
