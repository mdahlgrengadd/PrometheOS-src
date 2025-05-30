// Main application entry point - refactored from original monolithic index.js
import {
  initializeWebLLMEngine,
  onMessageSend,
  onMessageStop,
  getGPUVendor,
  getAvailableModels,
} from "./webllmEngine.js";
import { defaultModelId } from "./modelConfig.js";

/*************** UI initialization ***************/
const availableModels = getAvailableModels();
let selectedModel = defaultModelId;

/*************** UI binding ***************/
// Populate model selection dropdown
availableModels.forEach((modelId) => {
  const option = document.createElement("option");
  option.value = modelId;
  option.textContent = modelId;
  document.getElementById("model-selection").appendChild(option);
});
document.getElementById("model-selection").value = selectedModel;

// Event listeners
document
  .getElementById("download")
  .addEventListener("click", async function () {
    try {
      const gpuVendor = await getGPUVendor();
    } catch (e) {
      alert(e);
      return;
    }
    await initializeWebLLMEngine();
    document.getElementById("send").disabled = false;
    document.getElementById("download").disabled = true;
  });

document.getElementById("send").addEventListener("click", function () {
  onMessageSend();
});

document.getElementById("stop").addEventListener("click", function () {
  onMessageStop();
});
