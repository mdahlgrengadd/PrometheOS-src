import { useEffect, useState } from 'react';

import { IApiContextValue, IOpenApiSpec } from '@/api/core/types';
import { useApi } from '@/api/hooks/useApi';

/**
 * Hook to get the OpenAPI specification for the API
 * @returns The OpenAPI specification and a refresh function
 */
export const useOpenApiSpec = (): {
  spec: IOpenApiSpec | null;
  refreshSpec: () => void;
} => {
  const apiContext = useApi();
  const [spec, setSpec] = useState<IOpenApiSpec | null>(null);

  const refreshSpec = () => {
    if (apiContext) {
      const apiSpec = apiContext.getOpenApiSpec();
      setSpec(apiSpec);
    }
  };

  useEffect(() => {
    // Only fetch once on mount
    refreshSpec();

    // No automatic polling to prevent UI refreshes
  }, [apiContext]);

  return { spec, refreshSpec };
};
