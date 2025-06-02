import React from "react";

import { Plugin, PluginInitData } from "../../types";
import AppPreview from "./components/AppPreview";
import { manifest } from "./manifest";

// Store initialization data globally for this plugin instance
let globalInitData: PluginInitData | undefined = undefined;

const AppPreviewPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async (initData?: PluginInitData) => {
    console.log("App Preview plugin initialized");
    globalInitData = initData;
  },
  render: (initData?: PluginInitData) => {
    // Use the latest initData or fallback to global
    const currentInitData = initData || globalInitData;
    return <AppPreview initFromUrl={currentInitData} />;
  },
  onOpen: (initData?: PluginInitData) => {
    console.log("App Preview opened with:", initData);
    // Update global initData when opening
    if (initData) {
      globalInitData = initData;
    }
  },
  onClose: () => {
    console.log("App Preview closed");
    // Reset init data on close
    globalInitData = undefined;
  },
};

export default AppPreviewPlugin;
