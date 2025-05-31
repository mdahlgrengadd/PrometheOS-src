import React from "react";

const LoadingScreen = () => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-green-500 rounded-full animate-spin mx-auto"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Initializing Python Runtime
          </h2>
          <p className="text-blue-200">Loading Pyodide and dependencies...</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
