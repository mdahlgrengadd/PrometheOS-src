import React from "react";

import { Plugin, PluginManifest } from "../../types";
import { manifest } from "./manifest";
import WordEditorComponent from "./WordEditor";

const WordEditorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Word Editor Pro plugin initialized");
  },
  render: () => {
    return (
      <div className="text-primary">
        <WordEditorComponent />
      </div>
    );
  },
};

export default WordEditorPlugin;
