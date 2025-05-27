import '../styles/isolated.css';

import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BetterFrontendExplorer from './BetterFrontendExplorer';
import SwaggerExplorer from './SwaggerExplorer';

/**
 * API Explorer Switcher component that allows switching between
 * the custom API explorer and the Swagger UI explorer
 */
const ApiExplorerSwitcher: React.FC = () => {
  const [view, setView] = useState<"swagger" | "frontend">("frontend");

  return (
    <div className="h-full flex flex-col api-explorer-isolated">
      <Tabs
        value={view}
        onValueChange={(value) => setView(value as "swagger" | "frontend")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="frontend">Frontend Explorer</TabsTrigger>
          <TabsTrigger value="swagger">Swagger UI (FastAPI Style)</TabsTrigger>
        </TabsList>

        <TabsContent value="swagger" className="flex-1">
          <SwaggerExplorer />
        </TabsContent>

        <TabsContent value="frontend" className="flex-1">
          <BetterFrontendExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiExplorerSwitcher;
