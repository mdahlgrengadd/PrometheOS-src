
export const installRequiredPackages = async (userScript: string, pyodide: any): Promise<void> => {
  if (!pyodide) return;

  try {
    // Extract import statements from the script
    const importRegex = /^(?:from\s+(\S+)|import\s+(\S+))/gm;
    const imports = new Set<string>();
    let match;

    while ((match = importRegex.exec(userScript)) !== null) {
      const moduleName = match[1] || match[2];
      if (moduleName && !moduleName.startsWith('.')) {
        // Get the base module name (before any dots)
        const baseModule = moduleName.split('.')[0];
        imports.add(baseModule);
      }
    }

    console.log('Detected imports:', Array.from(imports));

    // Common package mappings for pyodide
    const packageMappings: Record<string, string> = {
      'sklearn': 'scikit-learn',
      'cv2': 'opencv-python',
      'PIL': 'pillow',
      'bs4': 'beautifulsoup4',
      'yaml': 'pyyaml',
      'requests': 'requests',
      'matplotlib': 'matplotlib',
      'seaborn': 'seaborn',
      'plotly': 'plotly',
      'dash': 'dash',
      'streamlit': 'streamlit',
      'flask': 'flask',
      'fastapi': 'fastapi',
      'pandas': 'pandas',
      'numpy': 'numpy',
      'scipy': 'scipy',
      'sympy': 'sympy',
      'nltk': 'nltk',
      'spacy': 'spacy',
      'transformers': 'transformers',
      'torch': 'torch',
      'tensorflow': 'tensorflow',
      'keras': 'keras',
      'xgboost': 'xgboost',
      'lightgbm': 'lightgbm',
      'catboost': 'catboost'
    };

    // Built-in modules to skip
    const builtInModules = [
      'sys', 'os', 'json', 'random', 'datetime', 'time', 'math', 're', 'collections', 
      'itertools', 'functools', 'operator', 'pathlib', 'typing', 'copy', 'pickle', 
      'csv', 'sqlite3', 'uuid', 'hashlib', 'base64', 'urllib', 'http', 'email', 
      'html', 'xml', 'logging', 'threading', 'multiprocessing', 'subprocess', 'io', 
      'tempfile', 'shutil', 'glob', 'fnmatch', 'platform', 'socket', 'ssl', 'ftplib', 
      'smtplib', 'imaplib', 'poplib', 'telnetlib', 'argparse', 'configparser', 
      'getopt', 'readline', 'rlcompleter'
    ];

    // Try to install packages
    for (const moduleName of imports) {
      if (builtInModules.includes(moduleName)) {
        continue;
      }

      const packageToInstall = packageMappings[moduleName] || moduleName;
      
      try {
        console.log(`Installing package: ${packageToInstall}`);
        
        // First try to load it as a pyodide package
        try {
          await pyodide.loadPackage(packageToInstall);
          console.log(`Successfully loaded pyodide package: ${packageToInstall}`);
        } catch (pyodideError) {
          console.log(`${packageToInstall} not available in pyodide, trying micropip...`);
          
          // If not available in pyodide, try micropip
          await pyodide.runPythonAsync(`
try:
    import micropip
    await micropip.install("${packageToInstall}")
    print("Successfully installed ${packageToInstall} via micropip")
except Exception as e:
    print(f"Failed to install ${packageToInstall}: {e}")
          `);
        }
      } catch (installError) {
        console.warn(`Failed to install ${packageToInstall}:`, installError);
        // Continue with other packages even if one fails
      }
    }
  } catch (error) {
    console.error('Error installing packages:', error);
    throw new Error('Some packages may not have been installed correctly');
  }
};
