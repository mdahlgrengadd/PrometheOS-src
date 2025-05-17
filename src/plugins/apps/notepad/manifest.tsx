import React from "react";

import {
  textareaApiActions,
  textareaApiDoc,
} from "@/components/ui/api/textarea-api";

import { PluginManifest } from "../../../plugins/types";

// Export for backwards compatibility
export { textareaApiDoc, textareaApiActions };

export const manifest: PluginManifest & { apiDoc?: typeof textareaApiDoc } = {
  id: "notepad",
  name: "Notepad",
  version: "1.0.0",
  description: "A simple text editor",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34688_ans_beos_ans_beos.png"
      className="h-8 w-8"
      alt="Notepad"
    />
  ),
  entry: "apps/notepad",
  apiDoc: textareaApiDoc,
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "notepad.js",
  preferredSize: {
    width: 600,
    height: 400,
  },
};
