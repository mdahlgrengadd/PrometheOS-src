/**
 * Worker-specific WebLLM plugin implementation that doesn't depend on React or DOM
 * This handles all the model loading and inference logic
 */

import * as webllm from '@mlc-ai/web-llm';

import { WorkerPlugin } from '../../plugins/types';

// Interface for progress updates
export interface ProgressUpdate {
  text: string;
  progress: number;
}

// Define message interface (same as in UI)
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * WebLLM plugin implementation for worker
 */
const WorkerWebLLM: WorkerPlugin = {
  id: "webllm",

  // Private state
  _engine: null as webllm.MLCEngine | null,
  _currentModel: null as string | null,
  _progress: null as ProgressUpdate | null,

  /**
   * Load a model with progress updates
   */
  async loadModel(
    modelName: string
  ): Promise<{ status: string; message?: string }> {
    try {
      // Clean up existing engine if needed
      if (this._engine) {
        // Clean up old engine resources if any
        this.cleanup();
      }

      this._currentModel = modelName;
      this._progress = {
        text: "Starting model initialization...",
        progress: 0,
      };

      // Initialize engine with progress callback
      this._engine = await webllm.CreateMLCEngine(modelName, {
        initProgressCallback: (progress) => {
          this._progress = {
            text: progress.text || "Initializing...",
            progress: progress.progress,
          };
        },
      });

      return { status: "success" };
    } catch (error) {
      console.error("Error initializing model:", error);
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        message,
      };
    }
  },

  /**
   * Get current progress
   */
  getProgress(): ProgressUpdate | null {
    return this._progress;
  },

  /**
   * Chat with the model, returning a ReadableStream of response chunks
   */
  chat(messages: Message[], temperature: number = 0.7): ReadableStream<string> {
    const engine = this._engine;

    return new ReadableStream<string>({
      async start(controller) {
        if (!engine) {
          controller.error(
            new Error("Model not loaded. Please load a model first.")
          );
          return;
        }

        try {
          // Convert messages to format expected by webllm
          const apiMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

          // Create completions with streaming
          const chunks = await engine.chat.completions.create({
            messages: apiMessages,
            temperature,
            stream: true,
          });

          for await (const chunk of chunks) {
            const content = chunk.choices[0]?.delta.content || "";
            controller.enqueue(content);
          }

          controller.close();
        } catch (error) {
          console.error("Error generating response:", error);
          controller.error(error);
        }
      },
    });
  },

  /**
   * Clean up resources
   */
  cleanup(): void {
    this._engine = null;
    this._currentModel = null;
    this._progress = null;
  },

  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "loadModel": {
        if (!params || typeof params.modelName !== "string") {
          return { error: "Invalid parameters for loadModel" };
        }
        return this.loadModel(params.modelName);
      }

      case "getProgress": {
        return this.getProgress();
      }

      case "chat": {
        if (!params || !Array.isArray(params.messages)) {
          return { error: "Invalid parameters for chat" };
        }

        const temperature =
          typeof params.temperature === "number" ? params.temperature : 0.7;

        return this.chat(params.messages as Message[], temperature);
      }

      case "cleanup": {
        this.cleanup();
        return { status: "success" };
      }

      default:
        return { error: `Method ${method} not supported for webllm` };
    }
  },
};

// Export the webllm plugin instance as default
export default WorkerWebLLM;
