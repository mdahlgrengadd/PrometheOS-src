// Tool handler class for different model types
import { rules } from './config.js';

export class ToolHandler {
  qwen_template =
   'You are Qwen, created by Alibaba Cloud. You are a helpful assistant.\n\n'
  +'# Tools\n\n'
  +'You may call one or two functions to assist with the user query.\n\n'
  +'You are provided with function signatures within <tools></tools> XML tags:\n'
  +'<tools>\n'
  +'#{functions}\n'
  +'</tools>\n\n'
  +'For each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:\n'
  +'<tool_call>\n'
  +'{"name": <function-name>, "arguments": <args-json-object>}\n'
  +'</tool_call>\n'
  +'You are a helpful Assistant.\n'
  +'Do not generate function results.\n'
  +'Always do real call of functions, when it is required.\n'
  +'Execute only one function per time.\n'

  hermes3_template =
   `You are a function calling AI model. You are provided with function signatures within <tools></tools> XML tags. `
  +`You may call one or more functions to assist with the user query. `
  +`Don't make assumptions about what values to plug into functions. Here are the available tools: <tools> \n`
  +` #{functions} \n`
  +` </tools>\n`
  +`Use the following pydantic model json schema for each tool call you will make:`
  +` {"properties": {"name": {"title": "Name", "type": "string"}, "arguments": {"title": "Arguments", "type": "object"}}, "required": ["name", "arguments"], "title": "FunctionCall", "type": "object"}}\n\n`
  +`For each function call return a json object with function name and arguments within <tool_call></tool_call> XML tags as follows:\n\n`
  +`<tool_call>\n{"name": <function-name>, "arguments": <args-dict>}\n</tool_call>\n\n`
  +'You are a helpful Assistant.\n'
  +'Do not generate function results.\n'
  +'Always do real call of functions, when it is required.\n'
  +'Execute only one function per time\n';

  llama32_template =
   'Environment: ipython\n'
  +'Cutting Knowledge Date: December 2023\n'
  +'Today Date: 26 Jul 2024\n\n'
  +'Given the following functions, please respond with a JSON for a function call with its proper arguments that best answers the given prompt.\n\n'
  +'Respond in the format\n <tool_call>\n{"name": function name, "parameters": dictionary of argument name and its value}\n</tool_call> .\n\n'
  +'Do not use variables.\n\n'
  +'#{functions}\n\n'
  +'You are a helpful Assistant.\n'
  +'Do not generate function results.\n'
  +'Always do real call of functions, when it is required.\n'
  +'Execute only one function per time.\n'

  llama31_template =
   'Cutting Knowledge Date: December 2023\n'
  +'Today Date: 23 Jul 2024\n\n'
  +'# Tool Instructions\n'
  +'- When looking for real time information use relevant functions if available\n'
  +'You have access to the following functions:\n'
  +'#{functions}\n'
  +'If a you choose to call a function ONLY reply in the following format:\n'
  +'  <function>{"name": function name, "parameters": dictionary of argument name and its value}</function>\n'
  +'Here is an example,\n'
  +'  <function>{"name": "example_function_name", "parameters": {"example_name": "example_value"}}</function>\n'
  +'Reminder:\n'
  +'- Function calls MUST follow the specified format and use BOTH <function> and </function>\n'
  +'- Required parameters MUST be specified\n'
  +'- Only call one function at a time\n'
  +'- When calling a function, do NOT add any other words, ONLY the function calling\n'
  +'- Put the entire function call reply on one line\n'
  +'- Always add your sources when using search results to answer the user query\n'
  +'You are a helpful Assistant.\n'
  +'Do not generate function results.\n'
  +'Always do real call of functions, when it is required.\n'
  +'Execute only one function per time.\n'

  llama31_storm_template =
   `You are a function calling AI model. You may call one or more functions to assist with the user query.`
  +` Don't make assumptions about what values to plug into function. The user may use the terms function`
  +` calling or tool use interchangeably.\n\n`
  +`Here are the available functions:\n`
  +`<tools>#{functions_list}</tools>\n\n`
  +`For each function call return a json object with function name and arguments within <tool_call></tool_call>`
  +` XML tags in the format:\n`
  +`<tool_call>{"tool_name": <function-name>, "tool_arguments": <args-dict>}</tool_call>`

  gorilla_template = 
   `You are an AI programming assistant, utilizing the Gorilla LLM model, developed by Gorilla LLM,`
  +` and you only answer questions related to computer science. For politically sensitive questions,`
  +` security and privacy issues, and other non-computer science questions, you will refuse to answer.`
  +`### Instruction\n`
  +`#{functions_list}\n`

  deepseek_template =
   'Cutting Knowledge Date: December 2023\n'
  +'Today Date: 23 Jul 2024\n\n'
  +'# Tool Instructions\n'
  +'- When looking for real time information use relevant functions if available\n'
  +'You have access to the following functions:\n\n'
  +'#{functions}\n'
  +'If a you choose to call a function ONLY reply in the following format:\n'
  +'  <tool_call>{"name": function name, "parameters": dictionary of argument name and its value}</tool_call>\n'
  +'Here is an example,\n'
  +'  <tool_call>{"name": "example_function_name", "parameters": {"example_name": "example_value"}}</tool_call>\n'
  +'Reminder:\n'
  +'- Function calls MUST follow the specified format and use BOTH <tool_call> and </tool_call>\n'
  +'- Required parameters MUST be specified\n'
  +'- Only call one function at a time\n'
  +'- When calling a function, do NOT add any other words, ONLY the function calling\n'
  +'- Put the entire function call reply on one line\n'
  +'- Always add your sources when using search results to answer the user query\n'
  +'You are a helpful Assistant.\n'
  +'Do not generate function results.\n'
  +'Always do real call of functions, when it is required\n'
  +'Execute only one function per time\n';

  rexp_tool_call = /<tool_call>[\s\S]*<\/tool_call>$/;
  rexp_function = /<function>[\s\S]*<\/function>$/;

  constructor(model_id) {
    if (model_id.startsWith('Qwen2.5'))
      this.mode = 'qwen';
    else if (model_id.startsWith('Hermes-3-Llama'))
      this.mode = 'hermes3_llama'
    else if (model_id.startsWith('Llama-3.1-Storm'))
      this.mode = 'llama31_storm'
    else if (model_id.startsWith('Llama-3.1-'))
      this.mode = 'llama31'
    else if (model_id.startsWith('Llama-3.2-'))
      this.mode = 'llama32'
    else if (model_id.startsWith('DeepSeek-R1-Distill-Llama'))
      this.mode = 'deepseek'
    else if (model_id.startsWith('gorilla'))
      this.mode = 'gorilla'
    else
      this.mode = 'llama31';
    this.tool_call_id=0;
  }
  
  createSystemPrompt(tools) {
    let sys_template = "";
    let funcs = "";
    for(const t of tools)
       funcs += JSON.stringify(t, '\n', 2)+'\n\n';

    if (this.mode==='qwen')
      sys_template = this.qwen_template.replace('#{functions}', funcs);
    else if (this.mode==='hermes3_llama')
      sys_template = this.hermes3_template.replace('#{functions}', funcs);
    else if (this.mode==='llama31')
      sys_template = this.llama31_template.replace('#{functions}', funcs);
    else if (this.mode==='llama31_storm')
      sys_template = this.llama31_storm_template.replace('#{functions_list}', JSON.stringify(tools,'\n', 2));
    else if (this.mode==='llama32')
      sys_template = this.llama32_template.replace('#{functions}', funcs);
    else if (this.mode==='deepseek')
      sys_template = this.deepseek_template.replace('#{functions}', funcs);
    else if (this.mode==='gorilla')
      sys_template = this.gorilla_template.replace('#{functions_list}', JSON.stringify(tools,'\n', 2));

    return sys_template + `\n\n ${JSON.stringify(rules, '\n', 2)}\n`
  }

  checkResponse(str) {
    let tool_call = null;
    let is_end = false;

    str = str.trim();
    const tool_end = str.match(this.rexp_tool_call);
    const function_end = str.match(this.rexp_function);

    if (this.mode==='qwen' || this.mode==='hermes3_llama') {
      if (str.startsWith("<tool_call>")) {
        tool_call = str.replace("<tool_call>", "").replace("</tool_call>", "");
      }
      else if (tool_end) {
        tool_call = tool_end[0].replace("<tool_call>", "").replace("</tool_call>", "");
        is_end = true;
      }
    }
    else if (this.mode==='llama32') {
      if (str.startsWith("<tool_call>") || str.startsWith("<|python_tag|>") || str.startsWith("{")) {
        tool_call = str.replace(/^\<\|python_tag\|\>\n?\s*/, "").replace("<tool_call>", "").replace("</tool_call>", "");
      }
      else if (tool_end) {
        tool_call = tool_end[0].replace(/^\<\|python_tag\|\>\n?\s*/, "").replace("<tool_call>", "").replace("</tool_call>", "");
        is_end = true;
      }
    }
    else if (this.mode==='llama31_storm') {
      if (str.startsWith("<tool_call>")) {
        tool_call = str.replace("<tool_call>", "").replace("</tool_call>", "");
      }
      else if (tool_end) {
        tool_call = tool_end[0].replace("<tool_call>", "").replace("</tool_call>", "");
        is_end = true;
      }
    }
    else if (this.mode==='llama31') {
      if (str.startsWith("<function>")) {
        tool_call = str.replace("<function>", "").replace("</function>", "");
      }
      else if (function_end) {
        tool_call = function_end[0].replace("<function>", "").replace("</function>", "");
        is_end = true;
      }
    }
    else if (this.mode==='deepseek') {
      const message = str.replace(/<think>.*?<\/think>/s, "").trim();
      if (message.startsWith("<tool_call>")) {
        tool_call = message.replace("<tool_call>", "").replace("</tool_call>", "");
      }
      else if (tool_end) {
        tool_call = tool_end[0].replace("<tool_call>", "").replace("</tool_call>", "");
        is_end = true;
      }
    }
    else if (this.mode==='gorilla') {
      if (str.startsWith("<<function>>")) {
        tool_call = str.replace("<<function>>", "").trim();
      }
      else if (function_end) {
        tool_call = function_end[0].replace("<<function>>", "").trim();
        is_end = true;
      }
      if (tool_call) {
        let i = tool_call.indexOf('(')
        if (i!=-1) {
          const fname = tool_call.substring(0, i);
          const body = this.convertToJSON(tool_call.substring (i))
          tool_call = `{"name":"${fname}", "arguments":${body}}`
        }
      }
      console.log(tool_call)
    }

    if (tool_call) {
      try {
        const func = JSON.parse(tool_call);

        if (func.tool_name)
          func["name"] = func.tool_name;
        if (func.tool_arguments)
          func["arguments"] = func.tool_arguments;

        if (func.parameters)
          func["arguments"] = func.parameters;

        return {func, tool_call, end: is_end};
      } catch(e) {
        console.log(e);
        return {error: e.toString()}
      }
    }
    return null;
  }

  genToolResponse(func, ret) {
    let rc = null;
    if (this.mode==='qwen') {
      const content = `<tool_response>\n{name:${func.name}, content:${ret} }\n</tool_response>`
      rc = {content, tool_call_id: this.tool_call_id, role:'user'}; // Qwen2 role=user
      this.tool_call_id++;
    }
    else if (this.mode==='deepseek') {
      const content = `<tool_response>\n{name:${func.name}, content:${ret} }\n</tool_response>`
      rc = {content, tool_call_id: this.tool_call_id, role:'user'}; // DeepSeek role=user
      this.tool_call_id++;
    }
    else {
      const content = `<tool_response>\n{name:${func.name}, content:${ret} }\n</tool_response>`
      rc = {content, tool_call_id: this.tool_call_id, role:'tool'};
    }
    this.tool_call_id++;
    return rc;
  }

  convertToJSON(input) {
    // Remove the surrounding parentheses
    let content = input.slice(1, -1);

    // Initialize an empty object to store the parsed data
    let result = {};
    let key = '';
    let value = '';
    let inQuotes = false;
    let escapeNext = false;

    let i = 0;
    while (i < content.length) {
        const char = content[i];

        if (inQuotes) {
            if (char === '"' && !escapeNext) {
                inQuotes = false;
            } else if (char === '\\' && !escapeNext) {
                escapeNext = true;
            } else {
                value += char;
                escapeNext = false;
            }
        } else if (char === '=') {
            key = content.slice(0, i).trim();
            value = '';
        } else if (char === ',') {
            value = value.trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/\\"/g, '"');
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1).replace(/\\"/g, '"');
            } else if (value === 'true' || value === 'false') {
                value = value === 'true';
            } else if (!isNaN(value)) {
                value = Number(value);
            }
            result[key] = value;
            key = '';
            value = '';
        } else if (char === '"') {
            inQuotes = true;
        } else {
            value += char;
        }

        i++;
    }

    // Handle the last key-value pair
    value = value.trim();
    if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value === 'true' || value === 'false') {
        value = value === 'true';
    } else if (!isNaN(value)) {
        value = Number(value);
    }
    result[key] = value;

    return JSON.stringify(result);
  }
}
