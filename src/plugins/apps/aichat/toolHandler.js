// Tool handler class for different model types
import { rules } from './config.js';
import JSON5 from 'json5';

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
        // Robust JSON parsing with multiple fallback strategies
        const result = this.parseJSONRobustly(tool_call);
        if (result.success) {
          return this.processValidToolCall(result.data, tool_call, is_end);
        } else {
          console.log("All JSON parsing strategies failed:", result.error);
          return { error: `JSON parsing failed: ${result.error}` };
        }
      } catch(e) {
        console.log("Tool call processing error:", e);
        console.log("Original tool_call:", tool_call);
        return {error: e.toString()}
      }
    }
    return null;
  }

  parseJSONRobustly(jsonString) {
    const cleanedInput = jsonString.trim();
    
    // Strategy 1: Try parsing as-is with standard JSON parser
    try {
      const result = JSON.parse(cleanedInput);
      return { success: true, data: result };
    } catch (error1) {
      console.log("Strategy 1 (standard JSON.parse) failed:", error1.message);
    }

    // Strategy 2: Try with JSON5 for more lenient parsing
    try {
      const result = JSON5.parse(cleanedInput);
      return { success: true, data: result };
    } catch (error2) {
      console.log("Strategy 2 (JSON5.parse) failed:", error2.message);
    }

    // Strategy 3: Clean up control characters and common issues
    try {
      const cleanedJson = this.fixJSONControlCharacters(cleanedInput);
      const result = JSON.parse(cleanedJson);
      return { success: true, data: result };
    } catch (error3) {
      console.log("Strategy 3 (with control character cleanup) failed:", error3.message);
    }

    // Strategy 4: Try with JSON5 after cleanup
    try {
      const cleanedJson = this.fixJSONControlCharacters(cleanedInput);
      const result = JSON5.parse(cleanedJson);
      return { success: true, data: result };
    } catch (error4) {
      console.log("Strategy 4 (JSON5 with cleanup) failed:", error4.message);
    }

    // Strategy 5: Aggressive cleaning and standard JSON
    try {
      const aggressiveClean = this.aggressiveJSONClean(cleanedInput);
      const result = JSON.parse(aggressiveClean);
      return { success: true, data: result };
    } catch (error5) {
      console.log("Strategy 5 (aggressive clean + JSON.parse) failed:", error5.message);
    }

    // Strategy 6: Aggressive cleaning and JSON5
    try {
      const aggressiveClean = this.aggressiveJSONClean(cleanedInput);
      const result = JSON5.parse(aggressiveClean);
      return { success: true, data: result };
    } catch (error6) {
      console.log("Strategy 6 (aggressive clean + JSON5) failed:", error6.message);
    }

    // Strategy 7: Manual parsing for severely corrupted JSON
    try {
      const result = this.manualJSONParse(cleanedInput);
      if (result) {
        return { success: true, data: result };
      }
    } catch (error7) {
      console.log("Strategy 7 (manual parsing) failed:", error7.message);
    }

    // Strategy 8: Extract function name and arguments using regex patterns
    try {
      const result = this.extractFunctionCallRegex(cleanedInput);
      if (result) {
        return { success: true, data: result };
      }
    } catch (error8) {
      console.log("Strategy 8 (regex extraction) failed:", error8.message);
    }

    return { 
      success: false, 
      error: "All parsing strategies failed. Input: " + cleanedInput.substring(0, 100) + "..." 
    };
  }
  manualJSONParse(jsonString) {
    // Try to extract function name and arguments manually when JSON is severely corrupted
    try {
      // Look for patterns like "name": "something" and "arguments": {...}
      const nameMatch = jsonString.match(/"name"\s*:\s*"([^"]+)"/);
      const argsMatch = jsonString.match(/"arguments"\s*:\s*({[^}]*}|\[[^\]]*\]|"[^"]*"|\d+|true|false|null)/);
      
      if (nameMatch) {
        const name = nameMatch[1];
        let args = {};
        
        if (argsMatch) {
          try {
            args = JSON.parse(argsMatch[1]);
          } catch (e) {
            // If arguments parsing fails, try to extract simple key-value pairs
            args = this.extractSimpleArguments(argsMatch[1]);
          }
        }
        
        return { name, arguments: args };
      }
      
      // Try alternative patterns
      const altNameMatch = jsonString.match(/name\s*:\s*"?([^",}]+)"?/);
      const altArgsMatch = jsonString.match(/arguments\s*:\s*({[^}]*})/);
      
      if (altNameMatch) {
        const name = altNameMatch[1].replace(/"/g, '');
        let args = {};
        
        if (altArgsMatch) {
          try {
            args = JSON.parse(altArgsMatch[1]);
          } catch (e) {
            args = this.extractSimpleArguments(altArgsMatch[1]);
          }
        }
        
        return { name, arguments: args };
      }
      
      return null;
    } catch (error) {
      console.log("Manual JSON parsing failed:", error);
      return null;
    }
  }

  extractSimpleArguments(argString) {
    // Extract simple key-value pairs when JSON parsing fails
    const result = {};
    try {
      // Remove braces
      const cleaned = argString.replace(/[{}]/g, '');
      // Split by commas
      const pairs = cleaned.split(',');
      
      for (const pair of pairs) {
        const colonIndex = pair.indexOf(':');
        if (colonIndex > 0) {
          const key = pair.substring(0, colonIndex).trim().replace(/"/g, '');
          const value = pair.substring(colonIndex + 1).trim().replace(/"/g, '');
          result[key] = value;
        }
      }
    } catch (error) {
      console.log("Failed to extract simple arguments:", error);
    }
    return result;
  }
  extractFunctionCallRegex(input) {
    // Last resort: use regex to extract function calls
    const patterns = [
      // Pattern 1: {"name": "func", "arguments": {...}}
      /"name"\s*:\s*"([^"]+)"[\s\S]*"arguments"\s*:\s*({[^}]*})/,
      // Pattern 2: {name: "func", arguments: {...}}
      /name\s*:\s*"([^"]+)"[\s\S]*arguments\s*:\s*({[^}]*})/,
      // Pattern 3: Just function name
      /"name"\s*:\s*"([^"]+)"/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        const name = match[1];
        let args = {};
        
        if (match[2]) {
          try {
            args = JSON.parse(match[2]);
          } catch (e) {
            args = this.extractSimpleArguments(match[2]);
          }
        }
        
        return { name, arguments: args };
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
  processValidToolCall(func, cleanedToolCall, is_end) {
    // Normalize the function object to handle different formats
    if (func.tool_name)
      func["name"] = func.tool_name;
    if (func.tool_arguments)
      func["arguments"] = func.tool_arguments;
    if (func.parameters)
      func["arguments"] = func.parameters;

    return {func, tool_call: cleanedToolCall, end: is_end};
  }

  aggressiveJSONClean(jsonString) {
    // More aggressive cleaning for problematic JSON strings
    try {
      let cleaned = jsonString.trim();
      
      // Remove any text before the first {
      const firstBrace = cleaned.indexOf('{');
      if (firstBrace > 0) {
        cleaned = cleaned.substring(firstBrace);
      }
      
      // Find the last complete JSON object
      let braceCount = 0;
      let lastValidEnd = -1;
      
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '{') {
          braceCount++;
        } else if (cleaned[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastValidEnd = i + 1;
          }
        }
      }
      
      if (lastValidEnd > 0) {
        cleaned = cleaned.substring(0, lastValidEnd);
      }
      
      // Fix common JSON issues
      cleaned = cleaned
        // Fix unescaped quotes in string values
        .replace(/:\s*"([^"]*)"([^",}\]]*)"([^",}\]]*)/g, (match, p1, p2, p3) => {
          return `: "${p1}\\"${p2}\\"${p3}"`;
        })
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Ensure proper string escaping
        .replace(/\\n/g, '\\\\n')
        .replace(/\\t/g, '\\\\t')
        .replace(/\\r/g, '\\\\r');
      
      return cleaned;
    } catch (error) {
      console.log("Error in aggressive JSON cleaning:", error);
      return jsonString;
    }
  }
  fixJSONControlCharacters(jsonString) {
    // This method attempts to fix JSON strings that contain unescaped control characters
    // and other common JSON parsing issues
    try {
      let cleanedJson = jsonString.trim();
      
      // Remove any trailing text after the JSON (common issue with AI responses)
      // Look for the closing brace that should end the JSON
      const openBraces = (cleanedJson.match(/\{/g) || []).length;
      const closeBraces = (cleanedJson.match(/\}/g) || []).length;
      
      if (openBraces > 0 && closeBraces > 0) {
        // Find the position where we have balanced braces
        let braceCount = 0;
        let endPosition = -1;
        
        for (let i = 0; i < cleanedJson.length; i++) {
          if (cleanedJson[i] === '{') {
            braceCount++;
          } else if (cleanedJson[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endPosition = i + 1;
              break;
            }
          }
        }
        
        if (endPosition > 0) {
          cleanedJson = cleanedJson.substring(0, endPosition);
        }
      }
      
      // Fix string values that contain unescaped control characters
      cleanedJson = cleanedJson.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match, content) => {
        // Skip if already properly escaped
        if (content.includes('\\n') || content.includes('\\t') || content.includes('\\r')) {
          return match;
        }
        
        // Escape control characters and other problematic characters
        const escaped = content
          .replace(/\\/g, '\\\\')     // Escape backslashes first
          .replace(/\n/g, '\\n')      // Escape newlines
          .replace(/\r/g, '\\r')      // Escape carriage returns
          .replace(/\t/g, '\\t')      // Escape tabs
          .replace(/\f/g, '\\f')      // Escape form feeds
          .replace(/[\b]/g, '\\b')    // Escape backspaces (use character class to avoid word boundary)
          .replace(/\v/g, '\\v')      // Escape vertical tabs
          .replace(/\0/g, '\\0')      // Escape null characters
          .replace(/"/g, '\\"');      // Escape quotes
        
        return `"${escaped}"`;
      });
      
      return cleanedJson;
    } catch (error) {
      console.log("Error fixing JSON control characters:", error);
      return jsonString;
    }
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
