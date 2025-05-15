/**
 * Worker-specific WebLLM plugin implementation that doesn't depend on React or DOM
 * This handles all the model loading and inference logic
 */

import * as webllm from '@mlc-ai/web-llm';

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

// Define type for WebLLM worker plugin
export interface WorkerWebLLMType {
  id: string;
  loadModel(modelName: string): Promise<{ status: string; message?: string }>;
  chat(messages: Message[], temperature: number): ReadableStream<string>;
  getProgress(): ProgressUpdate | null;
  cleanup(): void;
}

// Implementation of WebLLM plugin for worker
export class WorkerWebLLM implements WorkerWebLLMType {
  id = "webllm";
  private engine: webllm.MLCEngine | null = null;
  private currentModel: string | null = null;
  private progress: ProgressUpdate | null = null;

  // Load a model with progress updates
  async loadModel(
    modelName: string
  ): Promise<{ status: string; message?: string }> {
    try {
      // Clean up existing engine if needed
      if (this.engine) {
        // Clean up old engine resources if any
        this.cleanup();
      }

      this.currentModel = modelName;
      this.progress = { text: "Starting model initialization...", progress: 0 };

      // Initialize engine with progress callback
      this.engine = await webllm.CreateMLCEngine(modelName, {
        initProgressCallback: (progress) => {
          this.progress = {
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
  }

  // Get current progress
  getProgress(): ProgressUpdate | null {
    return this.progress;
  }

  // Chat with the model, returning a ReadableStream of response chunks
  chat(messages: Message[], temperature: number = 0.7): ReadableStream<string> {
    const engine = this.engine;

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
  }

  // Clean up resources
  cleanup(): void {
    this.engine = null;
    this.currentModel = null;
    this.progress = null;
  }
}

// Export a singleton instance
export const WorkerWebLLMInstance = new WorkerWebLLM();
