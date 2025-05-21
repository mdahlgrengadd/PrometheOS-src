import React from 'react';

const GettingStarted = () => (
  <div className="flex-1 overflow-auto p-4">
    <h2 className="text-2xl font-bold mb-4">Getting Started with API Explorer</h2>
    <p className="mb-4 text-gray-700">
      The API Explorer allows you to browse and interact with available API components and their actions.
    </p>
    <h3 className="text-xl font-semibold mb-2">Launching Apps</h3>
    <p className="mb-4 text-gray-700">
      To view API components, ensure an application that exposes an API is running. You can start an app manually from the desktop, or programmatically using the Launch App API. For example: <code className="bg-gray-100 px-1 rounded">launchApp("notepad")</code> will start Notepad and its APIs will appear here.
    </p>
    <h3 className="text-xl font-semibold mb-2">How to use</h3>
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
      <li>Use the search bar on the left to find a component by name, type, or path.</li>
      <li>Click on a component to view its available actions.</li>
      <li>Fill in required parameters for the action in the form fields.</li>
      <li>Click <strong>Execute</strong> to perform the action and see the response below.</li>
      <li>View code examples in JavaScript or React to integrate API calls into your application.</li>
    </ol>
    <h3 className="text-xl font-semibold mb-2">Swagger UI</h3>
    <p className="text-gray-700 mb-4">
      Switch to the <strong>Swagger UI</strong> tab to see FastAPI-style documentation with interactive "Try it out" functionality.
    </p>
    <p className="text-gray-700">
      Use the <strong>Refresh</strong> button to reload the OpenAPI specification if the API changes.
    </p>
  </div>
);

export default GettingStarted; 