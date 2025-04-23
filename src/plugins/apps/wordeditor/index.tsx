import React from "react";

import WordEditorComponent from "@/components/WordEditor";

import { Plugin, PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "WordEditor",
  name: "Word Editor Pro",
  version: "2.0.0",
  description: "Advanced word processing application with rich text editing",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34684_aim_be_be_aim.png"
      className="h-8 w-8"
      alt="Word Editor Pro"
    />
  ),
  entry: "apps/wordeditor",
  preferredSize: {
    width: 980,
    height: 750,
  },
};

const WordEditorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Word Editor Pro plugin initialized");
  },
  render: () => {
    return <WordEditorComponent />;
  },
};

export default WordEditorPlugin;
