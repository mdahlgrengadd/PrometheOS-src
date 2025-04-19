import React from "react";
import { useShell } from "@/contexts/ShellContext";
import { ArrowLeft } from "lucide-react";
import { getApp } from "@/data/apps";

const AppScreen: React.FC = () => {
  const { activeApp, closeApp } = useShell();
  
  if (!activeApp) return null;
  
  const app = getApp(activeApp);
  if (!app) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-white animate-fade-in flex flex-col">
      {/* App header - fixed */}
      <div className={`px-4 py-3 flex items-center ${app.color}`}>
        <button 
          onClick={() => closeApp(activeApp)}
          className="p-1 rounded-full bg-white/20"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="ml-4 text-white font-semibold">{app.name}</h1>
      </div>
      
      {/* App content - scrollable */}
      <div className="flex-1 scrollable">
        <div className="p-6 flex flex-col items-center justify-center min-h-full">
          <div className="flex flex-col items-center bg-gray-50 rounded-lg shadow-sm p-8 max-w-md w-full">
            <app.icon size={64} className={`p-3 rounded-xl ${app.color} text-white`} />
            <p className="mt-4 text-xl font-medium">{app.name} App Content</p>
            <p className="mt-2 text-gray-500 text-center">
              This is a placeholder for the {app.name.toLowerCase()} application. In a real app, this would contain the actual functionality.
            </p>
            
            {/* Demo content based on app type */}
            {app.id === 'notes' && (
              <div className="mt-6 bg-white p-4 rounded border w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            )}
            
            {app.id === 'calendar' && (
              <div className="mt-6 grid grid-cols-7 gap-1 w-full">
                {Array(28).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square flex items-center justify-center text-xs bg-white border rounded">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            
            {app.id === 'mail' && (
              <div className="mt-6 space-y-2 w-full">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-3 bg-white rounded border">
                    <div className="flex justify-between">
                      <div className="font-medium">Sender {i + 1}</div>
                      <div className="text-xs text-gray-500">11:0{i}</div>
                    </div>
                    <div className="text-sm truncate">Message preview goes here...</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppScreen;
