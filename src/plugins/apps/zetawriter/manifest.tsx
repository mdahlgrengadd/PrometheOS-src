import React from "react";

import { PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "zetawriter",
  name: "ZetaWriter",
  version: "1.0.0",
  description:
    "A powerful LibreOffice-based word processor with advanced editing features",
  author: "Desktop System",
  icon: (
    <img
      src={
        import.meta.env.BASE_URL +
        "/icons/34772_beos_paper_pen_write_pen_paper_beos_write.png"
      }
      className="h-8 w-8"
      alt="ZetaWriter"
    />
  ),
  entry: "apps/zetawriter",
  preferredSize: {
    width: 1024,
    height: 768,
  },
  hideWindowChrome: false,
  frameless: false,
};
