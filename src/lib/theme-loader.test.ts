import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAvailableExternalThemes, loadExternalTheme } from "./theme-loader";

// Mock the theme manifest
vi.mock("./theme-manifest.json", () => ({
  default: {
    themeManifestVersion: "1.0.0",
    themes: [
      {
        id: "test-theme",
        name: "Test Theme",
        author: "Tester",
        version: "1.0.0",
        description: "A test theme",
        cssUrl: "/themes/test.css",
        preview: "/themes/previews/test.png",
        desktopBackground: "#ff0000",
        decoratorPath: "/themes/test/decorator.js",
        cssVariables: {
          "--wm-border-width": "1px",
          "--wm-border-color": "#000000",
          "--window-background": "#ffffff",
        },
      },
      {
        id: "invalid-theme",
        name: "Invalid Theme",
        // Missing required fields
      },
    ],
  },
}));

// Mock loadThemeCSS to avoid DOM manipulation
vi.mock("./theme-loader", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadThemeCSS: vi.fn().mockResolvedValue(undefined),
    loadThemeDecorator: vi.fn().mockResolvedValue({}),
    // Export the real functions we want to test
    getAvailableExternalThemes: actual.getAvailableExternalThemes,
    loadExternalTheme: actual.loadExternalTheme,
  };
});

describe("theme-loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAvailableExternalThemes", () => {
    it("should return themes from the manifest", () => {
      const themes = getAvailableExternalThemes();
      expect(themes).toHaveLength(2);
      expect(themes[0].id).toBe("test-theme");
    });
  });

  describe("loadExternalTheme", () => {
    it("should validate theme and return null for invalid themes", async () => {
      const theme = await loadExternalTheme("invalid-theme");
      expect(theme).toBeNull();
    });

    it("should load valid themes", async () => {
      const theme = await loadExternalTheme("test-theme");
      expect(theme).not.toBeNull();
      expect(theme?.id).toBe("test-theme");
      expect(theme?.name).toBe("Test Theme");
    });
  });
});
