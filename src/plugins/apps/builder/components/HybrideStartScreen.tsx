import {
  BookOpen,
  Bot,
  Briefcase,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Github,
  Lightbulb,
  Link,
  Star,
} from "lucide-react";
import React from "react";

const HybrideStartScreen = () => {
  const startItems = [
    { icon: FileText, text: "New File...", color: "text-blue-400" },
    { icon: FolderOpen, text: "Open File...", color: "text-blue-400" },
    { icon: Folder, text: "Open Folder...", color: "text-blue-400" },
    {
      icon: GitBranch,
      text: "Clone Git Repository...",
      color: "text-blue-400",
    },
    { icon: Link, text: "Connect to...", color: "text-blue-400" },
    {
      icon: Briefcase,
      text: "New Workspace with Copilot...",
      color: "text-blue-400",
    },
  ];

  const recentItems = [
    { name: "Lab4", path: "D:\\AI_DVA264_Lab3_RandomRestart" },
    { name: "AI_DVA264_Lab3_RandomRestart", path: "D:\\" },
    { name: "Lab4", path: "D:\\" },
    {
      name: "draggable-desktop-dreamscape",
      path: "C:\\Users\\mdahl\\Documents\\GitHub",
    },
    { name: "prometheos-3d", path: "D:\\" },
  ];

  const walkthroughItems = [
    {
      icon: Star,
      text: "Get started with HS Code",
      subtitle: "Customize your editor, learn the basics, and start coding",
      badge: null,
      selected: true,
    },
    {
      icon: Bot,
      text: "Getting Started with Container Tools",
      subtitle: null,
      badge: "New",
    },
    {
      icon: Lightbulb,
      text: "Learn the Fundamentals",
      subtitle: null,
      badge: null,
    },
    {
      icon: BookOpen,
      text: "Get Started With GitLens",
      subtitle: null,
      badge: "Updated",
    },
    {
      icon: Github,
      text: "GitHub Copilot",
      subtitle: null,
      badge: "Updated",
    },
  ];

  return (
    <div className="bg-gray-900 h-full flex flex-col p-4">
      <div className="bg-gray-900 text-gray-100 w-full max-w-6xl mx-auto flex-1 flex flex-col p-8 font-sans">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-200 mb-2">
            HybrIDE Studio Code
          </h1>
          <p className="text-gray-400 text-lg">Editing involved</p>
        </div>

        {/* Main Content */}
        <div className="flex gap-16 flex-1 min-h-0">
          {/* Left Column */}
          <div className="flex-1 overflow-y-auto">
            {/* Start Section */}
            <div className="mb-8">
              <h2 className="text-xl font-medium text-gray-200 mb-4">Start</h2>
              <div className="space-y-1">
                {startItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer"
                  >
                    <item.icon size={16} className={item.color} />
                    <span className={`text-sm ${item.color}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Section */}
            <div>
              <h2 className="text-xl font-medium text-gray-200 mb-4">Recent</h2>
              <div className="space-y-1">
                {recentItems.map((item, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 rounded hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="text-sm text-blue-400">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.path}</div>
                  </div>
                ))}
                <div className="px-2 py-1 text-sm text-blue-400 hover:bg-gray-800 cursor-pointer rounded">
                  More...
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-xl font-medium text-gray-200 mb-4">
              Walkthroughs
            </h2>
            <div className="space-y-2">
              {walkthroughItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    item.selected
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.selected ? "bg-blue-500" : "bg-gray-700"
                      }`}
                    >
                      <item.icon size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-100">
                        {item.text}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-gray-300">{item.subtitle}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="px-3 py-2 text-sm text-blue-400 hover:bg-gray-800 cursor-pointer rounded">
                More...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybrideStartScreen;
