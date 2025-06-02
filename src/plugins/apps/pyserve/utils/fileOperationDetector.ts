
export const detectFileOperations = (scriptContent: string): string[] => {
  const filePatterns = [
    'open\\s*\\(\\s*["\']([^"\']+)["\']',
    'pd\\.read_csv\\s*\\(\\s*["\']([^"\']+)["\']',
    'pd\\.read_excel\\s*\\(\\s*["\']([^"\']+)["\']',
    'np\\.loadtxt\\s*\\(\\s*["\']([^"\']+)["\']',
    'with\\s+open\\s*\\(\\s*["\']([^"\']+)["\']'
  ];
  
  const detectedFiles = new Set<string>();
  for (const pattern of filePatterns) {
    const regex = new RegExp(pattern, 'g');
    const matches = Array.from(scriptContent.matchAll(regex));
    matches.forEach(match => {
      if (match[1]) {
        detectedFiles.add(match[1]);
      }
    });
  }
  
  return Array.from(detectedFiles);
};
