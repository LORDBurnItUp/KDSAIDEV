/**
 * OpenClaw Service — Douglas AI Engine
 * Smart cascade: Free first (Groq → Gemini) → Paid fallback (OpenRouter → Anthropic → OpenAI)
 * Token-efficient routing: simple queries go to fast/free, complex to premium
 */

const axios = require('axios');
const verdant = require('./verdant');
const ollamaService = require('./ollama');
const qdrantMemory = require('./qdrant');

const ANTHROPIC_API_KEY   = (process.env.ANTHROPIC_API_KEY   || '').trim();
const OPENAI_API_KEY      = (process.env.OPENAI_API_KEY      || '').trim();
const OPENROUTER_API_KEY  = (process.env.OPENROUTER_API_KEY  || '').trim();
const GROQ_API_KEY        = (process.env.GROQ_API_KEY        || '').trim();
const GOOGLE_API_KEY      = (process.env.GOOGLE_API_KEY      || '').trim();

// Circuit breaker state
const circuitBreaker = {
  failures: 0,
  lastFailure: 0,
  state: 'closed', // closed, open, half-open
  threshold: 3,      // failures before opening
  resetTimeout: 30000 // 30 seconds
};

// Token usage tracker (in-memory, resets on restart)
const tokenUsage = {
  groq:        { input: 0, output: 0, calls: 0 },
  gemini:      { input: 0, output: 0, calls: 0 },
  ollama:      { input: 0, output: 0, calls: 0 },
  openrouter:  { input: 0, output: 0, calls: 0 },
  anthropic:   { input: 0, output: 0, calls: 0 },
  openai:      { input: 0, output: 0, calls: 0 },
};

function trackTokens(provider, input = 0, output = 0) {
  if (tokenUsage[provider]) {
    tokenUsage[provider].input  += input;
    tokenUsage[provider].output += output;
    tokenUsage[provider].calls  += 1;
  }
}

/**
 * Circuit breaker: record a failure
 */
function recordFailure() {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  if (circuitBreaker.failures >= circuitBreaker.threshold) {
    circuitBreaker.state = 'open';
    console.warn('⚠ Circuit breaker OPEN - pausing AI requests for 30s');
  }
}

/**
 * Circuit breaker: record success
 */
function recordSuccess() {
  circuitBreaker.failures = 0;
  circuitBreaker.state = 'closed';
}

/**
 * Circuit breaker: check if we can proceed
 * Returns true if circuit is closed or half-open
 */
function canProceed() {
  if (circuitBreaker.state === 'closed') return true;
  
  if (circuitBreaker.state === 'open') {
    if (Date.now() - circuitBreaker.lastFailure > circuitBreaker.resetTimeout) {
      circuitBreaker.state = 'half-open';
      console.log('🔄 Circuit breaker HALF-OPEN - testing...');
      return true;
    }
    return false;
  }
  
  // half-open state allows one request through
  return true;
}

/**
 * Estimate rough complexity of a query to route cheaply when possible
 * Returns 'simple' | 'complex'
 */
function classifyQuery(content) {
  const words = content.trim().split(/\s+/).length;
  const complexKeywords = /code|implement|build|create|debug|explain|analyse|analyze|refactor|architecture|design|generate|write a|full|complete/i;
  if (words > 60 || complexKeywords.test(content)) return 'complex';
  return 'simple';
}

const OPENCLAW_SYSTEM = `You are Douglas — a sophisticated, technical AI engine from London, embedded in the VoxCode platform.
You speak with a refined British accent and personality: professional, slightly dry, and extremely precise.

Rules:
- Your name is Douglas.
- Use British English spelling (e.g., "colour", "optimise").
- Always respond in 5–10 lines max unless outputting code.
- Use bullet points for lists.
- For code output, use markdown code fences with language tags.
- Be surgical and precise — no padding.`;

// Shorter system prompt for simple/free model calls to save tokens
const OPENCLAW_SYSTEM_BRIEF = `You are Douglas, a precise British AI. Be concise, use British spelling. Max 6 lines unless writing code.`;

/**
 * Build context from relevant memories
 * @param {string} query - User's query
 * @returns {Promise<string>} - Context string from memories
 */
async function buildMemoryContext(query) {
  try {
    const memories = await qdrantMemory.recall(query, 3, 0.65);
    const knowledge = await qdrantMemory.searchKnowledge(query, 2, 0.6);
    
    let context = '';
    
    if (memories.length > 0) {
      context += '\n📝 Relevant memories:\n';
      memories.forEach((mem, i) => {
        context += `${i + 1}. ${mem.text} (relevance: ${(mem.score * 100).toFixed(0)}%)\n`;
      });
    }
    
    if (knowledge.length > 0) {
      context += '\n📚 Knowledge base:\n';
      knowledge.forEach((k, i) => {
        context += `${i + 1}. [${k.source}] ${k.text}\n`;
      });
    }
    
    if (context) {
      console.log(`🧠 Memory context loaded: ${memories.length} memories, ${knowledge.length} knowledge entries`);
    }
    
    return context;
  } catch (error) {
    // Differentiate between expected (not configured) vs actual errors
    if (error.message?.includes('Qdrant client not initialized') || 
        error.message?.includes('not initialized')) {
      return ''; // Expected when Qdrant is not configured
    }
    console.error('⚠ Memory context error:', error.message);
    return '';
  }
}

/**
 * Store important conversation in memory
 * @param {string} content - User message
 * @param {string} response - AI response
 */
async function storeConversationContext(content, response) {
  try {
    // Store user message
    await qdrantMemory.storeConversationMessage(content, 'user', { 
      response_preview: response.substring(0, 100) 
    });
    
    // Store assistant response as a memory if it's substantive
    if (response.length > 50) {
      await qdrantMemory.storeMemory(response, { 
        context: content.substring(0, 100),
        type: 'conversation_response'
      });
    }
    
    // Periodic cleanup check (every 10 conversations to avoid excessive API calls)
    if (Math.random() < 0.1) { // ~10% chance
      try {
        await qdrantMemory.cleanupMemories();
      } catch (cleanupError) {
        // Non-critical, don't break the flow
      }
    }
  } catch (error) {
    // Non-critical, don't break the flow
    if (!error.message?.includes('not initialized')) {
      console.error('⚠ Failed to store conversation:', error.message);
    }
  }
}

/**
 * Groq — free, ultra-fast (Llama 3.3 70B or 8B)
 */
async function tryGroq(content, complex) {
  if (!GROQ_API_KEY) return null;
  if (!canProceed()) return null;
  const model = complex ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
  const systemPrompt = complex ? OPENCLAW_SYSTEM : OPENCLAW_SYSTEM_BRIEF;
  try {
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ],
      max_tokens: complex ? 1000 : 400,
      temperature: 0.7
    }, {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 12000
    });
    const usage = res.data.usage || {};
    trackTokens('groq', usage.prompt_tokens, usage.completion_tokens);
    console.log(`✓ Douglas via Groq (${model}) | tokens: ${usage.prompt_tokens || '?'}in ${usage.completion_tokens || '?'}out`);
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error('Groq Error:', err.response?.data?.error?.message || err.message);
    recordFailure();
    return null;
  }
}

/**
 * Gemini — free tier via GOOGLE_API_KEY (gemini-2.0-flash)
 */
async function tryGemini(content) {
  if (!GOOGLE_API_KEY) return null;
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        system_instruction: { parts: [{ text: OPENCLAW_SYSTEM_BRIEF }] },
        contents: [{ role: 'user', parts: [{ text: content }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
    );
    const candidate = res.data.candidates?.[0];
    if (!candidate) return null;
    const text = candidate.content?.parts?.[0]?.text;
    if (!text) return null;
    const usage = res.data.usageMetadata || {};
    trackTokens('gemini', usage.promptTokenCount, usage.candidatesTokenCount);
    console.log(`✓ Douglas via Gemini Flash | tokens: ${usage.promptTokenCount || '?'}in ${usage.candidatesTokenCount || '?'}out`);
    return text;
  } catch (err) {
    console.error('Gemini Error:', err.response?.data?.error?.message || err.message);
    recordFailure();
    return null;
  }
}

/**
 * Ollama — local free AI (runs on your machine)
 */
async function tryOllama(content) {
  const ollama = require('./ollama');
  const health = await ollama.healthCheck();
  if (!health.ok) {
    console.log('⚠ Ollama not running (local AI unavailable)');
    return null;
  }
  try {
    const response = await ollama.generate(content, ollama.getDefaultModel());
    if (response) {
      console.log(`✓ Douglas via Ollama (${ollama.getDefaultModel()})`);
      recordSuccess();
    }
    return response;
  } catch (err) {
    console.error('Ollama Error:', err.message);
    recordFailure();
    return null;
  }
}

/**
 * OpenRouter — broad model access, paid but has free models
 */
async function tryOpenRouter(content, complex) {
  if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.startsWith('sk-or')) return null;
  // Use a free OpenRouter model when available, else claude
  const model = complex ? 'anthropic/claude-3.5-sonnet' : 'meta-llama/llama-3.1-8b-instruct:free';
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages: [
        { role: 'system', content: complex ? OPENCLAW_SYSTEM : OPENCLAW_SYSTEM_BRIEF },
        { role: 'user', content }
      ],
      max_tokens: complex ? 1000 : 400
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://kingsfromearthdevelopment.com',
        'X-Title': 'Douglas SWAGCLAW',
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });
    const usage = res.data.usage || {};
    trackTokens('openrouter', usage.prompt_tokens, usage.completion_tokens);
    console.log(`✓ Douglas via OpenRouter (${model}) | tokens: ${usage.prompt_tokens || '?'}in ${usage.completion_tokens || '?'}out`);
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error('OpenRouter Error:', err.response?.data?.error?.message || err.message);
    recordFailure();
    return null;
  }
}

/**
 * Anthropic — premium, highest quality
 */
async function tryAnthropic(content) {
  if (!ANTHROPIC_API_KEY || !ANTHROPIC_API_KEY.startsWith('sk-ant')) return null;
  try {
    const res = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: OPENCLAW_SYSTEM,
      messages: [{ role: 'user', content }],
    }, {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    const usage = res.data.usage || {};
    trackTokens('anthropic', usage.input_tokens, usage.output_tokens);
    console.log(`✓ Douglas via Anthropic | tokens: ${usage.input_tokens || '?'}in ${usage.output_tokens || '?'}out`);
    return res.data.content[0].text;
  } catch (err) {
    if (err.response?.status === 401) console.error('✗ Anthropic Auth Failed (401)');
    else console.error('Anthropic Error:', err.message);
    recordFailure();
    return null;
  }
}

/**
 * OpenAI — paid fallback
 */
async function tryOpenAI(content) {
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) return null;
  try {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini', // cheaper than gpt-4o, still strong
      messages: [
        { role: 'system', content: OPENCLAW_SYSTEM },
        { role: 'user', content }
      ],
      max_tokens: 800
    }, {
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      timeout: 15000
    });
    const usage = res.data.usage || {};
    trackTokens('openai', usage.prompt_tokens, usage.completion_tokens);
    console.log(`✓ Douglas via OpenAI | tokens: ${usage.prompt_tokens || '?'}in ${usage.completion_tokens || '?'}out`);
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI Error:', err.message);
    recordFailure();
    return null;
  }
}

/**
 * Main entry — smart cascade with token-efficient routing
 * Order: Groq (free) → Gemini (free) → OpenRouter → Anthropic → OpenAI
 */
async function processCommand(content, type = 'chat') {
  const complexity = classifyQuery(content);
  console.log(`🧠 Query complexity: ${complexity} | routing...`);

  // Parallel Execution Strategy: Verdant
  if (content.toLowerCase().includes('parallel') || content.toLowerCase().includes('simultaneously')) {
    console.log('⚡ Verdant Parallel Mode Activated');
    // For now, decompose based on common patterns
    const subTasks = [
      { name: 'Architect', task: 'Design the logical flow' },
      { name: 'Engineer', task: 'Implement core functionality' }
    ];
    const parallelResults = await verdant.executeParallel(subTasks);
    return `⚡ **Verdant Parallel Execution Results**:\n${parallelResults.map(r => `- [${r.name}] ${r.output}`).join('\n')}`;
  }

  // Build memory context for relevant queries
  let memoryContext = '';
  if (type === 'chat') {
    memoryContext = await buildMemoryContext(content);
  }

  // Append memory context to user content if available
  const contentWithContext = memoryContext 
    ? `${content}\n\n${memoryContext}\n\nUse the above context from my memory if relevant to your response.`
    : content;

  // Free tier first
  let groqResult = await tryGroq(contentWithContext, complexity === 'complex');
  if (groqResult) {
    await storeConversationContext(content, groqResult);
    return groqResult;
  }

  let geminiResult = await tryGemini(contentWithContext);
  if (geminiResult) {
    await storeConversationContext(content, geminiResult);
    return geminiResult;
  }

  // Try local Ollama (free, runs on your machine)
  let ollamaResult = await tryOllama(contentWithContext);
  if (ollamaResult) {
    await storeConversationContext(content, ollamaResult);
    return ollamaResult;
  }

  // Paid fallbacks
  let openrouterResult = await tryOpenRouter(contentWithContext, complexity === 'complex');
  if (openrouterResult) {
    await storeConversationContext(content, openrouterResult);
    return openrouterResult;
  }

  let anthropicResult = await tryAnthropic(contentWithContext);
  if (anthropicResult) {
    await storeConversationContext(content, anthropicResult);
    return anthropicResult;
  }

  let openaiResult = await tryOpenAI(contentWithContext);
  if (openaiResult) {
    await storeConversationContext(content, openaiResult);
    return openaiResult;
  }

  return '🤖 **OpenClaw Error**: All AI providers exhausted. Check your `.env` for valid keys.';
}

/**
 * Get token usage stats
 */
function getTokenStats() {
  return tokenUsage;
}

/**
 * Get circuit breaker status
 */
function getCircuitBreakerStatus() {
  return { ...circuitBreaker };
}

module.exports = {
  processCommand,
  getTokenStats,
  getCircuitBreakerStatus,
  classifyQuery
};
