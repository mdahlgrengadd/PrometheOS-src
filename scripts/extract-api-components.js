#!/usr/bin/env node

/**
 * Extract API component definitions from TypeScript source files
 * This script parses the registerSystemApi.ts file to extract the actual API component definitions
 * and converts them to a format that can be used by the OpenAPI generator
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse the registerSystemApi.ts file to extract the servicesApiComponent definition
 */
function extractApiComponents() {
  const registerSystemApiPath = path.join(
    __dirname,
    "..",
    "src",
    "api",
    "system", 
    "registerSystemApi.ts"
  );
  
  if (!fs.existsSync(registerSystemApiPath)) {
    throw new Error(`registerSystemApi.ts not found at ${registerSystemApiPath}`);
  }
  
  const content = fs.readFileSync(registerSystemApiPath, "utf-8");
  
  // Extract the servicesApiComponent definition using regex
  // This looks for the export const servicesApiComponent: IApiComponent = { ... } block
  const componentMatch = content.match(
    /export const servicesApiComponent: IApiComponent = ({[\s\S]*?^});/m
  );
  
  if (!componentMatch) {
    throw new Error("Could not find servicesApiComponent definition in registerSystemApi.ts");
  }
  
  const componentDefinition = componentMatch[1];
  
  try {
    // Convert the TypeScript object literal to JSON
    // This is a simplified approach - we'll need to handle TypeScript-specific syntax
    const jsonStr = componentDefinition
      .replace(/(\w+):/g, '"$1":') // Quote property names
      .replace(/'/g, '"') // Convert single quotes to double quotes
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const component = JSON.parse(jsonStr);
    
    return {
      services: component
    };
  } catch (error) {
    console.error("Failed to parse component definition:", error);
    console.error("Extracted definition:", componentDefinition);
    throw new Error("Failed to parse servicesApiComponent definition as JSON");
  }
}

/**
 * Alternative approach: Use eval in a safe context to parse the TypeScript object
 */
function extractApiComponentsSafe() {
  const registerSystemApiPath = path.join(
    __dirname,
    "..",
    "src",
    "api",
    "system", 
    "registerSystemApi.ts"
  );
  
  if (!fs.existsSync(registerSystemApiPath)) {
    throw new Error(`registerSystemApi.ts not found at ${registerSystemApiPath}`);
  }
  
  const content = fs.readFileSync(registerSystemApiPath, "utf-8");
  
  // Extract the servicesApiComponent definition
  const componentMatch = content.match(
    /export const servicesApiComponent: IApiComponent = ({[\s\S]*?^});/m
  );
  
  if (!componentMatch) {
    throw new Error("Could not find servicesApiComponent definition in registerSystemApi.ts");
  }
  
  const componentDefinition = componentMatch[1];
  
  try {
    // Create a safe evaluation context
    const safeEval = new Function(`
      return ${componentDefinition};
    `);
    
    const component = safeEval();
    
    return {
      services: component
    };
  } catch (error) {
    console.error("Failed to evaluate component definition:", error);
    throw new Error("Failed to parse servicesApiComponent definition");
  }
}

// Export for use by other scripts
export { extractApiComponents, extractApiComponentsSafe };

// If run directly, output the extracted components
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    console.log("🔍 Extracting API components from registerSystemApi.ts...");
    const components = extractApiComponentsSafe();
    console.log("✅ Successfully extracted API components:");
    console.log(JSON.stringify(components, null, 2));
  } catch (error) {
    console.error("❌ Failed to extract API components:", error.message);
    process.exit(1);
  }
}
