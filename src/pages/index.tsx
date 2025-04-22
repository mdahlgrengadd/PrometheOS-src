import { ApiProvider } from '@/api/context/ApiContext';
import Desktop from '@/components/Desktop';
import { MacroProvider } from '@/macros/context/MacroContext';
import { PluginProvider } from '@/plugins/PluginContext';

const Index = () => {
  return (
    <ApiProvider>
      <MacroProvider>
        <PluginProvider>
          <Desktop />
        </PluginProvider>
      </MacroProvider>
    </ApiProvider>
  );
};

export default Index;
