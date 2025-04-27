import { beforeEach, describe, expect, it } from "vitest";

import { loadThemeCSS } from "./theme-loader";

describe("loadThemeCSS", () => {
  beforeEach(() => {
    // Clear any existing link tags from head
    document.head.innerHTML = "";
  });

  it("injects a link tag with correct attributes", async () => {
    const cssUrl = "https://unpkg.com/7.css@0.13.0/dist/7.css";
    await loadThemeCSS(cssUrl);
    const link = document.querySelector(
      `link[href="${cssUrl}"]`
    ) as HTMLLinkElement;
    expect(link).not.toBeNull();
    expect(link.rel).toBe("stylesheet");
    expect(link.href).toBe(cssUrl);
  });

  it("does not inject duplicate link tags", async () => {
    const cssUrl = "https://unpkg.com/7.css@0.13.0/dist/7.css";
    await loadThemeCSS(cssUrl);
    await loadThemeCSS(cssUrl);
    const links = document.querySelectorAll(`link[href="${cssUrl}"]`);
    expect(links.length).toBe(1);
  });
});
