import Ajv, { ErrorObject } from "ajv";

import { ExternalThemeManifest } from "@/lib/theme-types";
import themeSchema from "@/lib/themeManifest.schema.json";

// Initialize AJV
const ajv = new Ajv();
const validateSchema = ajv.compile(themeSchema);

/**
 * Required fields for a valid theme manifest
 */
const requiredFields = [
  "id",
  "name",
  "version",
  "cssVariables",
  "desktopBackground",
];

/**
 * Required CSS variables that all themes must define
 */
const requiredCssVariables = [
  // Window structure
  "--wm-border-width",
  "--wm-border-color",
  "--wm-border-radius",
  "--wm-header-height",

  // Colors
  "--window-background",
  "--window-text",
  "--window-header-background",
  "--window-header-text",
  "--window-header-button-hover",
  "--window-header-button-active",
  "--window-resize-handle",

  // Control buttons
  "--wm-btn-close-bg",
  "--wm-btn-minimize-bg",
  "--wm-btn-maximize-bg",

  // Theme-specific variables
  "--taskbar-bg",
  "--text-primary",
  "--accent-primary",
];

/**
 * Interface for validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Converts AJV errors to a more user-friendly format
 */
function formatAjvErrors(
  errors: ErrorObject[] | null | undefined
): ValidationError[] {
  if (!errors) return [];

  return errors.map((error) => {
    let fieldName = "unknown";

    // Handle different error types to extract field name
    if (error.instancePath) {
      // Remove leading slash if it exists
      fieldName = error.instancePath.startsWith("/")
        ? error.instancePath.substring(1)
        : error.instancePath;
    } else if (
      error.keyword === "required" &&
      error.params &&
      "missingProperty" in error.params
    ) {
      fieldName = error.params.missingProperty as string;
    }

    return {
      field: fieldName,
      message: error.message || "Unknown validation error",
    };
  });
}

/**
 * Validates if a theme manifest is properly formatted using AJV and the JSON schema
 * @param themeManifest The theme manifest to validate
 * @returns An array of validation errors, empty if valid
 */
export function validateThemeManifest(
  themeManifest: Partial<ExternalThemeManifest>
): ValidationError[] {
  const isValid = validateSchema(themeManifest);

  if (isValid) {
    return []; // No errors
  }

  // Convert AJV errors to our format
  return formatAjvErrors(validateSchema.errors);
}

/**
 * Simple check if a theme manifest is valid
 * @param themeManifest The theme manifest to validate
 * @returns Boolean indicating if the theme is valid
 */
export function isValidThemeManifest(
  themeManifest: Partial<ExternalThemeManifest>
): boolean {
  return validateSchema(themeManifest) as boolean;
}
