
import Desktop from "@/components/Desktop";
import { PluginProvider } from "@/plugins/PluginContext";

const Index = () => {
  return (
    <PluginProvider>
      <Desktop />
    </PluginProvider>
  );
};

export default Index;
