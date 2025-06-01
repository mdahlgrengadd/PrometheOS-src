import React from "react";

import { Plugin, PluginManifest, PluginInitData } from "../../types";
import { manifest } from "./manifest";
import WordEditorComponent from "./WordEditor";

// Global state for init data - simple approach for this demo
let globalInitData: PluginInitData | undefined;

const WordEditorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async (initData?: PluginInitData) => {
    console.log("Word Editor Pro plugin initialized", initData ? "with init data" : "without init data");
    globalInitData = initData;
  },
  onOpen: (initData?: PluginInitData) => {
    console.log("Word Editor Pro plugin opened", initData ? "with init data" : "without init data");
    // Update init data when opened with new data
    if (initData) {
      globalInitData = initData;
    }
  },
  render: () => {
    return (
      <div className="text-primary">
        <WordEditorComponent initData={globalInitData} />
      </div>
    );
  },
};

export default WordEditorPlugin;
