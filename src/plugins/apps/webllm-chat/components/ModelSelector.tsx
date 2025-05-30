import React from 'react';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  // Helper function to get display name for models
  const getModelDisplayName = (model: string): string => {
    if (model === "mockup-echo-llm") {
      return "🔄 Mockup Echo LLM (Test Model)";
    }
    return model;
  };

  return (
    <div className="flex items-center">
      <label htmlFor="model-select" className="mr-2 text-sm font-medium">
        Model:
      </label>
      <select
        id="model-select"
        className="bg-background border border-border text-foreground text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
        value={selectedModel}
        onChange={(e) => onSelectModel(e.target.value)}
        disabled={disabled}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {getModelDisplayName(model)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
