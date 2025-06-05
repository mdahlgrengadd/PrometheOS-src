import React from "react";

import { Plugin } from "../../types";
import { manifest } from "./manifest";

// Lazy import the Desktop3D component to avoid import issues during build
const Desktop3DLazy = React.lazy(() =>
  import("./components/Desktop3D").then((module) => ({
    default: module.default,
  }))
);

/**
 * Desktop 3D plugin - A complete 3D desktop environment
 */
const Desktop3DPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Desktop 3D plugin initialized");
  },
  render: () => {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <React.Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-lg">
                Loading 3D Environment...
              </div>
            </div>
          }
        >
          <Desktop3DLazy />
        </React.Suspense>
      </div>
    );
  },
};

export default Desktop3DPlugin;
