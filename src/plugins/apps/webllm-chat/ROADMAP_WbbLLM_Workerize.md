# Roadmap: Workerizing the WebLLM App

## Context Recap

- **Current State:**  
  The WebLLM chat app (`src/plugins/apps/webllm-chat/`) loads and runs large language models directly on the main thread. This causes sluggish UI, especially during model loading and inference.
- **Goal:**  
  Move all model loading and inference to a dedicated Web Worker using WebLLM's `CreateWebWorkerMLCEngine` API, ensuring a responsive UI and scalable architecture.
- **Reference:**  
  The project already uses a workerized plugin system for the calculator app, demonstrating familiarity with Comlink and worker communication patterns.

---

## Phase 1: Planning & Setup

### Sprint 1.1: Analysis & Requirements
- Review current WebLLM chat app structure and data flow.
- Identify all main-thread WebLLM calls (model loading, inference, streaming).
- Decide on communication method (Comlink recommended for ergonomics).

### Sprint 1.2: Worker Boilerplate
- Scaffold a new worker file (e.g., `webllm-worker.ts`).
- Set up build tooling to support worker imports (Vite, Webpack, etc.).
- Document the worker entry point and expected API.

---

## Phase 2: Worker Implementation

### Sprint 2.1: Model Loading in Worker
- Move model loading logic to the worker using `CreateWebWorkerMLCEngine`.
- Expose a `loadModel(modelName, options)` method.
- Send progress updates from worker to UI.

### Sprint 2.2: Inference & Streaming in Worker
- Expose a `chat(messages, options)` method for completions.
- Implement streaming support: send incremental results from worker to UI (using Comlink streams or postMessage).
- Handle errors and edge cases in worker.

---

## Phase 3: UI Integration

### Sprint 3.1: Client Wrapper
- Create a client wrapper in the React app to interact with the worker (mirroring the calculator plugin pattern).
- Replace direct WebLLM calls in the UI with worker API calls.
- Update UI to handle progress, streaming, and errors from the worker.

### Sprint 3.2: User Experience Polish
- Ensure loading indicators and streaming responses are smooth.
- Add fallback/error UI for worker failures.
- Test on all supported browsers.

---

## Phase 4: Testing & Optimization

### Sprint 4.1: Functional Testing
- Write unit and integration tests for worker communication.
- Test model switching, inference, and streaming in various scenarios.

### Sprint 4.2: Performance & Resource Tuning
- Profile memory and CPU usage.
- Optimize worker lifecycle (reuse, terminate, reload as needed).
- Document best practices for future plugin workerization.

---

## Phase 5: Documentation & Release

### Sprint 5.1: Documentation
- Write developer docs for the new workerized architecture.
- Update user docs to reflect improved performance and any UI changes.

### Sprint 5.2: Release & Feedback
- Deploy to staging/main.
- Gather user feedback and monitor for regressions.
- Plan for future workerized plugins (vision, audio, etc.).

---

## Summary Table

| Phase | Sprint | Goal                                      |
|-------|--------|-------------------------------------------|
| 1     | 1.1    | Analyze current app & requirements        |
| 1     | 1.2    | Scaffold worker boilerplate               |
| 2     | 2.1    | Move model loading to worker              |
| 2     | 2.2    | Move inference & streaming to worker      |
| 3     | 3.1    | Integrate worker API with React UI        |
| 3     | 3.2    | Polish user experience                    |
| 4     | 4.1    | Test worker functionality                 |
| 4     | 4.2    | Optimize performance                      |
| 5     | 5.1    | Document new architecture                 |
| 5     | 5.2    | Release and gather feedback               |

---

**Outcome:**  
WebLLM chat runs entirely in a worker, providing a responsive, scalable, and modern user experience.