import React from "react";

import { Plugin, PluginManifest } from "../../types";
import WordEditorComponent from "./WordEditor";

import { manifest } from './manifest';

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

