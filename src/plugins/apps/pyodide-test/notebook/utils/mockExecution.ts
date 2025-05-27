
// Mock execution function - to be replaced with real kernel integration
export const mockExecute = async (code: string): Promise<string> => {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simple mock responses for common Python patterns
  if (code.includes('print(')) {
    const match = code.match(/print\((.+)\)/);
    if (match) {
      try {
        // Simple evaluation for basic expressions
        const expr = match[1].replace(/['"]/g, '');
        return expr;
      } catch {
        return `Output: ${match[1]}`;
      }
    }
  }
  
  if (code.includes('=') && !code.includes('==')) {
    return ''; // Assignment statements don't return output
  }
  
  if (code.match(/^\d+\s*[\+\-\*\/]\s*\d+/)) {
    try {
      // Simple arithmetic evaluation
      const result = eval(code.replace(/[^0-9+\-*/.() ]/g, ''));
      return String(result);
    } catch {
      return `Result: ${code}`;
    }
  }
  
  // Default mock response
  return `Mock execution result for:\n${code}`;
};
