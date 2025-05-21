import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CustomExplorer from './CustomExplorer';
import SwaggerExplorer from './SwaggerExplorer';

/**
 * API Explorer Switcher component that allows switching between
 * the custom API explorer and the Swagger UI explorer
 */
const ApiExplorerSwitcher: React.FC = () => {
  const [view, setView] = useState<"swagger" | "custom">("swagger");

  return (
    <div className="h-full flex flex-col">
      <Tabs
        value={view}
        onValueChange={(value) => setView(value as "swagger" | "custom")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="swagger">Swagger UI (FastAPI Style)</TabsTrigger>
          <TabsTrigger value="custom">Custom Explorer</TabsTrigger>
        </TabsList>

        <TabsContent value="swagger" className="flex-1">
          <SwaggerExplorer />
        </TabsContent>

        <TabsContent value="custom" className="flex-1">
          <CustomExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiExplorerSwitcher;
