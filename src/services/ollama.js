/**
 * Ollama Service — Local Free AI Integration
 * Connects to locally running Ollama instance for free AI conversations
 * 
 * REQUIREMENTS:
 *   - Ollama must be installed and running locally
 *   - Run: ollama serve  (starts on http://localhost:11434)
 *   - Pull models: ollama pull llama2  (or other models)
 * 
 * DEFAULT MODEL: llama2 (free, local)
 */

const axios = require('axios');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama2';
const OLLAMA_TIMEOUT = process.env.OLLAMA_TIMEOUT || 60000; // 60s for local models

// Token usage tracker for Ollama
const tokenUsage = {
  ollama: { input: 0, output: 0, calls: 0 }
};

/**
 * Check if Ollama is running and accessible
 */
async function healthCheck() {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`, { timeout: 5000 });
    return { 
      ok: true, 
      models: res.data.models || [],
      host: OLLAMA_HOST 
    };
  } catch (err) {
    return { 
      ok: false, 
      reason: err.message,
      host: OLLAMA_HOST
    };
  }
}

/**
 * List available models on the Ollama instance
 */
async function listModels() {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`);
    return res.data.models || [];
  } catch (err) {
    console.error('Ollama list models error:', err.message);
    return [];
  }
}

/**
 * Generate a response from Ollama
 * @param {string} content - User message
 * @param {string} model - Model name (defaults to DEFAULT_MODEL)
 */
async function generate(content, model = DEFAULT_MODEL) {
  try {
    const res = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model,
      prompt: content,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        // Estimate tokens (Ollama doesn't return exact counts)
      }
    }, {
      timeout: OLLAMA_TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });

    // Track approximate usage
    const inputTokens = content.split(/\s+/).length;
    const outputTokens = (res.data.response || '').split(/\s+/).length;
    tokenUsage.ollama.input += inputTokens;
    tokenUsage.ollama.output += outputTokens;
    tokenUsage.ollama.calls += 1;

    console.log(`✓ Ollama (${model}) | ~${inputTokens}in ~${outputTokens}out`);
    return res.data.response;
  } catch (err) {
    console.error('Ollama Error:', err.message);
    return null;
  }
}

/**
 * Chat completion style (more compatible with OpenAI-like interfaces)
 */
async function chat(messages, model = DEFAULT_MODEL) {
  // Convert messages to prompt format for Ollama
  const prompt = messages
    .map(m => `${m.role === 'system' ? 'System' : m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
  
  return generate(prompt, model);
}

/**
 * Get token usage stats
 */
function getTokenStats() {
  return tokenUsage;
}

/**
 * Get default model name
 */
function getDefaultModel() {
  return DEFAULT_MODEL;
}

module.exports = {
  generate,
  chat,
  listModels,
  healthCheck,
  getTokenStats,
  getDefaultModel,
  DEFAULT_MODEL,
  OLLAMA_HOST
};
