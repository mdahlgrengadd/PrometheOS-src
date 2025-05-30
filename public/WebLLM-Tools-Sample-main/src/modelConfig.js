// Model configuration for WebLLM
import * as webllm from "https://unpkg.com/@mlc-ai/web-llm@0.2.78";

export function createAppConfig() {
  const appConfig = { model_list: [] };

  // Add prebuilt models
  for (const m of webllm.prebuiltAppConfig.model_list) {
    if (
      m.model_id.startsWith("Qwen2.5-7B") ||
      (m.model_id.startsWith("Llama-3.1-8B-") && !m.model_id.endsWith("-1k")) ||
      m.model_id.startsWith("Hermes-3-Llama-3.1")
    )
      appConfig.model_list.push(m);
  }

  // Add custom models
  appConfig.model_list.push({
    model: "https://huggingface.co/smalinin/Llama-3.1-Storm-8B_q4f32_1-MLC",
    model_id: "Llama-3.1-Storm-8B_q4f32_1-MLC",
    model_lib:
      "https://huggingface.co/smalinin/Llama-3.1-Storm-8B_q4f32_1-MLC/resolve/main/Llama-3.1-Storm-8B_q4f32_1-webgpu.wasm",
    low_resource_required: false,
    vram_required_MB: 5750,
    overrides: {
      context_window_size: 4096,
      prefill_chunk_size: 4096,
    },
  });

  appConfig.model_list.push({
    model:
      "https://huggingface.co/smalinin/gorilla-openfunctions-v2_q4f32_1-MLC",
    model_id: "gorilla-openfunctions-v2-q4f32_1-MLC",
    model_lib:
      "https://huggingface.co/smalinin/gorilla-openfunctions-v2_q4f32_1-MLC/resolve/main/gorilla-openfunctions-v2_q4f32_1-webgpu.wasm",
    vram_required_MB: 5660.67,
    low_resource_required: false,
    overrides: {
      context_window_size: 4096,
      prefill_chunk_size: 4096,
    },
  });

  appConfig.model_list.push({
    model: "https://huggingface.co/smalinin/Qwen2.5-14B-Instruct_q4f16_1-MLC",
    model_id: "Qwen2.5-14B-Instruct_q4f16_1-MLC",
    model_lib:
      "https://huggingface.co/smalinin/Qwen2.5-14B-Instruct_q4f16_1-MLC/resolve/main/Qwen2.5-14B-Instruct_q4f16_1-webgpu.wasm",
    low_resource_required: false,
    vram_required_MB: 10900.0,
    required_features: ["shader-f16"],
    overrides: {
      context_window_size: 4096,
      prefill_chunk_size: 2048,
    },
  });

  appConfig.model_list.push({
    model: "https://huggingface.co/smalinin/Qwen2.5-14B-Instruct_q4f32_1-MLC",
    model_id: "Qwen2.5-14B-Instruct_q4f32_1-MLC",
    model_lib:
      "https://huggingface.co/smalinin/Qwen2.5-14B-Instruct_q4f32_1-MLC/resolve/main/Qwen2.5-14B-Instruct_q4f32_1-webgpu.wasm",
    low_resource_required: false,
    vram_required_MB: 12000.0,
    overrides: {
      context_window_size: 4096,
      prefill_chunk_size: 4096,
    },
  });

  return appConfig;
}

export const defaultModelId = "Qwen2.5-7B-Instruct-q4f16_1-MLC";
