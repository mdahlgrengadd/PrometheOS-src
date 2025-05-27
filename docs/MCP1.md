Below is a concise road-map for getting **OpenAI-style function calling working in MLC WebLLM (≥ 0.2.41)**.  In short, you: (1) install a sufficiently recent web-llm package; (2) load a model that was fine-tuned for tool use (today this is the *Hermes-2-Pro* family); (3) pass a `tools` array that contains JSON-Schema function definitions when you call `engine.chat.completions.create`; and (4) parse `tool_calls` in the reply, execute the function locally, then feed the result back as a `tool`-role message so the model can keep talking.  Everything is 100 % browser-side and uses the same fields you already know from the OpenAI API.

---

## 1 . Check your version

Function calling first shipped in **npm @mlc-ai/web-llm 0.2.41** and is still labelled *beta* today (0.2.79).([GitHub][1])

```bash
npm i @mlc-ai/web-llm@latest   # or yarn / pnpm
```

## 2 . Load a function-calling capable model

Only the two *NousResearch Hermes-2-Pro* checkpoints are guaranteed to speak the required tool format so far:

```ts
const engine = await CreateMLCEngine(
  "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC",   // or Hermes-2-Pro-Mistral-7B
  { initProgressCallback }
);
```

These models were enabled by PR #451.  More models are on the roadmap in tracking issue #526.([GitHub][1])

## 3 . Describe your JavaScript/TypeScript functions

Define each function once, **exactly** as OpenAI expects, inside a `tools` array:

```ts
const tools = [{
  type: "function",
  function: {
    name: "getCurrentWeather",
    description: "Return weather for a city.",
    parameters: {
      type: "object",
      properties: {
        city:   { type: "string", description: "City name" },
        units:  { type: "string", enum: ["celsius","fahrenheit"] }
      },
      required: ["city"]
    }
  }
}];
```

JSON-Schema is enforced in WebLLM with a grammar so you always get valid `tool_calls`.([GitHub][1])

## 4 . Ask the model and let it pick a tool

```ts
const messages = [
  { role: "system", content: "You are a voice-enabled travel agent." },
  { role: "user",   content: "What’s the weather in Stockholm right now?" }
];

const reply = await engine.chat.completions.create({
  messages,
  tools,                 // ← our array from step 3
  tool_choice: "auto",   // model decides if / what to call
});
```

If the model decides to call a tool you will see:

```ts
reply.choices[0].message.tool_calls = [{
  id: "...",
  type: "function",
  function: { name: "getCurrentWeather", arguments: "{ \"city\":\"Stockholm\", \"units\":\"celsius\" }" }
}]
reply.choices[0].finish_reason === "tool_calls";
```

The schema and field names are byte-for-byte the same as OpenAI.([llm.mlc.ai][2])

## 5 . Execute the call and continue the dialogue

```ts
const { name, arguments: rawArgs } = reply.choices[0].message.tool_calls[0].function;
const args = JSON.parse(rawArgs);
const result = await getCurrentWeather(args.city, args.units);   // your own JS called

// tell the model what happened
messages.push(reply.choices[0].message); // assistant message with the call
messages.push({
  role: "tool",
  name,                       // "getCurrentWeather"
  content: JSON.stringify(result)
});

const finalAnswer = await engine.chat.completions.create({ messages, tools });
console.log(finalAnswer.choices[0].message.content);
```

Multi-round flows (tool → answer → next question) follow the exact same pattern.([llm.mlc.ai][2])

## 6 . Manual fallback (advanced)

If you **don’t** want to rely on the grammar-based API you can still do “manual function calling” by formatting everything yourself in the prompt—WebLLM keeps that route for maximum flexibility.([GitHub][1])

## 7 . Tips & Gotchas

| What to watch                  | Detail                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **WebGPU**                     | Users need a browser + GPU that supports the WebGPU standard.([GitHub][3])                                                    |
| **One call per reply (today)** | Hermes-2-Pro will only output one `tool_call` per assistant message. Loop if you need multiple tools.([GitHub][4])            |
| **Token budget**               | The schema is injected into the system prompt, so very large schemas eat context length.([GitHub][1])                         |
| **Security**                   | Treat arguments as untrusted user input—research shows tool calling can be a jailbreak vector.                                |
| **Version churn**              | The API is marked *beta*; breaking tweaks may still appear (see “Improvements for Function Calling” issue #462).([GitHub][5]) |

## 8 . Full runnable snippet (TypeScript)

```ts
import { CreateMLCEngine } from "@mlc-ai/web-llm";

(async () => {
  const engine = await CreateMLCEngine("Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC");

  const tools = [ /* JSON schema block from §3 */ ];
  const history = [
    { role: "system", content: "You are a helpful travel agent." },
    { role: "user",   content: "Is it warm in Stockholm today?" }
  ];

  // round 1 – model decides to call a tool
  const r1 = await engine.chat.completions.create({ messages: history, tools, tool_choice: "auto" });
  const call = r1.choices[0].message.tool_calls?.[0];
  const weather = await getCurrentWeather(JSON.parse(call.function.arguments).city, "celsius");

  history.push(r1.choices[0].message);               // assistant
  history.push({ role: "tool", name: call.function.name, content: JSON.stringify(weather) });

  // round 2 – model uses the tool result to answer the human
  const r2 = await engine.chat.completions.create({ messages: history });
  console.log(r2.choices[0].message.content);
})();
```

That’s all there is to it—**the same pattern you’d use against the OpenAI API, but running entirely inside the browser**.  Happy hacking!

---

### Sources consulted

1. WebLLM home page advertising “function-calling” support
2. GitHub README emphasising full OpenAI compatibility ([GitHub][3])
3. NPM README listing “function-calling (WIP)” and Hermes models
4. Issue #297 where the feature was first requested ([GitHub][4])
5. PR #451 that added Hermes-2-Pro function calling
6. Tracking issue #526 outlining the roadmap and beta label ([GitHub][1])
7. Basic Usage docs for `MLCEngine` APIs
8. MLC-LLM REST docs showing the `tools` / `tool_calls` schema ([llm.mlc.ai][2])
9. Medium article explaining tool-calling concepts ([Medium][6])
10. Academic paper discussing function-calling security risks

[1]: https://github.com/mlc-ai/web-llm/issues/526 "[Tracking][WebLLM] Function calling (beta) and Embeddings · Issue #526 · mlc-ai/web-llm · GitHub"
[2]: https://llm.mlc.ai/docs/deploy/rest.html "REST API — mlc-llm 0.1.0 documentation"
[3]: https://github.com/mlc-ai/web-llm?utm_source=chatgpt.com "mlc-ai/web-llm: High-performance In-browser LLM Inference Engine"
[4]: https://github.com/mlc-ai/web-llm/issues/297 "♥️ Function Calling-only model · Issue #297 · mlc-ai/web-llm · GitHub"
[5]: https://github.com/mlc-ai/web-llm/issues/526?utm_source=chatgpt.com "[Tracking][WebLLM] Function calling (beta) and Embeddings #526"
[6]: https://medium.com/%40rushing_andrei/function-calling-with-open-source-llms-594aa5b3a304?utm_source=chatgpt.com "Function Calling with Open-Source LLMs | by Andrei Bondarev"
