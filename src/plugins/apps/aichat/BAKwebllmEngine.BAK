// WebLLM engine management and chat functionality
import * as webllm from "https://unpkg.com/@mlc-ai/web-llm@0.2.78";
import { createAppConfig, defaultModelId } from './modelConfig.js';
import { tools } from './tools.js';
import { ToolHandler } from './toolHandler.js';
import { updateEngineInitProgressCallback, appendMessage, updateLastMessage } from './uiUtils.js';
import { fetch_wikipedia_content, sparql_exec } from './toolImplementations.js';

// Global state
const messages = [];
let tool_handler = null;
let selectedModel = defaultModelId;

// Create engine instance
const appConfig = createAppConfig();
const engine = new webllm.MLCEngine({appConfig: appConfig});
engine.setInitProgressCallback(updateEngineInitProgressCallback);

export async function initializeWebLLMEngine() {
  document.getElementById("user-input").textContent = 'Write and execute a sample SPARQL query'
  document.getElementById("download-status").classList.remove("hidden");
  selectedModel = document.getElementById("model-selection").value;

  let temperature = 0.5;

  if (selectedModel.startsWith('Llama-3.1-'))
    temperature = 0.4;

  const config = {
    temperature: temperature,
    top_p: 0.9,
    context_window_size: -1,
    sliding_window_size: 8192,
    prefill_chunk_size: 8192,
    attention_sink_size: 4096
  };
  await engine.reload(selectedModel, config);

  tool_handler = new ToolHandler(selectedModel);
  messages.push({role:"system", content:tool_handler.createSystemPrompt(tools)});
}

async function streamingGenerating(messages, onUpdate, onFinish, onError) {
  try {
    let curMessage = "";
    let usage;
    const completion = await engine.chat.completions.create({
      seed: 0,
      stream: true,
      messages,
      stream_options: { include_usage: true },
    });
    for await (const chunk of completion) {
      const curDelta = chunk.choices[0]?.delta.content;
      if (curDelta) {
        curMessage += curDelta;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
      onUpdate(curMessage);
    }
    const finalMessage = await engine.getMessage();
    messages.push({content:finalMessage, role:"assistant"});

    //Handle Tools
    let isToolCall = false;
    if (tool_handler) {
       const rc = tool_handler.checkResponse(finalMessage);
       if (rc) {
         if (!rc.error) {
           if (rc.end) {
             const aiMessage = {content: "working...", role: "assistant"};
             appendMessage(aiMessage);
           }
           onFinish("**func call:** "+rc.tool_call, usage);
           return {done: false, func: rc.func};
         } 
         else {
           onFinish(finalMessage+"\n"+"Error: "+rc.error, usage);
           return {done: false, func: rc.func, error:rc.error};
         }
       }
    }

    onFinish(finalMessage, usage);
  } catch (err) {
    onError(err);
  }
  return {done: true};
}

export async function onMessageStop() {
  engine.interruptGenerate();
}

export async function onMessageSend() {
  const input = document.getElementById("user-input").textContent.trim();
  const message = {
    content: input,
    role: "user",
  };
  if (input.length === 0) {
    return;
  }
  document.getElementById("send").disabled = true;
  document.getElementById("stop").disabled = false;

  messages.push(message);
  appendMessage(message);

  document.getElementById("user-input").value = "";
  document
    .getElementById("user-input")
    .setAttribute("placeholder", "Generating...");

  let done = false;
  let iter = 0;
  while(!done && iter < 3) {
    iter++;
    document.getElementById("send").disabled = true;

    const aiMessage = {
      content: "typing...",
      role: "assistant",
    };

    appendMessage(aiMessage);

    const onFinishGenerating = (finalMessage, usage) => {
      updateLastMessage(finalMessage);
      document.getElementById("send").disabled = false;
      const usageText =
        `prompt_tokens: ${usage.prompt_tokens}, ` +
        `completion_tokens: ${usage.completion_tokens}, ` +
        `prefill: ${usage.extra.prefill_tokens_per_s.toFixed(4)} tokens/sec, ` +
        `decoding: ${usage.extra.decode_tokens_per_s.toFixed(4)} tokens/sec`;
      document.getElementById("chat-stats").classList.remove("hidden");
      document.getElementById("chat-stats").textContent = usageText;
    };

    const rc = await streamingGenerating(
                   messages,
                   updateLastMessage,
                   onFinishGenerating,
                   console.error,
               );

    done = rc.done;

    if (!done && tool_handler) {
       if (rc.error) {
         messages.push({
                 content: 'Error: '+rc.error,
                 tool_call_id: 0,
                 role: 'user'});
       }
       else {
         const func = rc.func;

         const aiMessage = {content: "working...", role: "assistant"};
         appendMessage(aiMessage);

         let toolResp = null;

         try {
           if (func && func.name === "fetch_wikipedia_content") {
             const ret = await fetch_wikipedia_content(func.arguments.search_query);
             toolResp = tool_handler.genToolResponse(func, JSON.stringify(ret));
           } 
           else if (func && func.name === "sparql_exec") {
             const ret = await sparql_exec(func.arguments.query);
             toolResp = tool_handler.genToolResponse(func, JSON.stringify(ret));
           } 
           else {
             const content = 'Error: Unknown function '+func?.name;
             toolResp = tool_handler.genToolResponse(func, JSON.stringify(content));
           }

         } catch (e) {
            const content = 'Error: '+e.toString()
            toolResp = tool_handler.genToolResponse(func, JSON.stringify(content));
         }

         messages.push({
                 content: toolResp.content,
                 tool_call_id: toolResp ? toolResp.tool_call_id : 0,
                 role: toolResp.role});
         updateLastMessage("**func result:** "+toolResp.content);
       }
  
    }
  }
  document.getElementById("stop").disabled = true;
}

export async function getGPUVendor() {
  return await engine.getGPUVendor();
}

export function getAvailableModels() {
  return appConfig.model_list.map((m) => m.model_id);
}
