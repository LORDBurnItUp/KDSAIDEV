import { Tier1Memory } from './memory/tier1-sqlite';
import { querySemanticMemory, embedConversation, ingestKnowledge, searchConversations } from './memory/tier2-pinecone';
import { logActivity, logCost, storeValue, getValue } from './memory/tier3-supabase';

/**
 * Agent Orchestrator — The "GOTCHA-inspired" loop for KDS
 * 
 * Every message flows through:
 * 1. Goals (user intent + stored facts)
 * 2. Orchestration (parallel memory loading)
 * 3. Tools (memory tools, workflow triggers)
 * 4. Context (conversation + semantic memory)
 * 5. Response (LLM generation)
 * 6. Post-processing (save, embed, extract, log)
 */

// ════════════════════════════════════════════════════════
// TOOLS (Agent-accessible memory tools)
// ════════════════════════════════════════════════════════

/**
 * remember_fact — Explicitly store a fact to core memory
 * Usage: remember_fact("The user's name is Omar")
 */
export async function rememberFact(fact: string, category = 'user'): Promise<string> {
  try {
    Tier1Memory.saveFact(fact, category);
    await logActivity('remember_fact', { fact, category });
    return `✅ Fact saved: "${fact}" (category: ${category})`;
  } catch (err) {
    console.error('[remember_fact] Error:', err);
    return `⚠️ Failed to save fact (Tier 1 degraded)`;
  }
}

/**
 * recall_memory — Search semantic memory and display core facts
 * Usage: recall_memory("What do you know about me?")
 */
export async function recallMemory(query?: string, chatId = 'default'): Promise<string> {
  const facts = Tier1Memory.getCoreMemory();
  const summary = Tier1Memory.getSummary(chatId);
  const recent = Tier1Memory.getRecentMessages(chatId, 10);
  
  if (query) {
    const semantic = await querySemanticMemory(chatId, query);
    const results = [...semantic.conversations, ...semantic.knowledge]
      .map(r => JSON.stringify(r).slice(0, 200))
      .join('\n') || 'No relevant memories found.';
    return `### Semantic Results\n${results}`;
  }
  
  return `### Core Facts\n${facts.join('\n') || 'None yet.'}\n\n### Recent\n${recent.map(m => `${m.role}: ${m.content.slice(0, 100)}`).join('\n') || 'No recent messages.'}`;
}

/**
 * add_to_memory — Ingest YouTube transcripts, URLs, or text into knowledge base
 * Usage: add_to_memory("https://youtube.com/watch?v=xxx", "transcript")
 */
export async function addToMemory(source: string, content: string): Promise<string> {
  try {
    // Chunk with 150-char overlap
    await ingestKnowledge(source, content, 500, 150);
    await logActivity('add_to_memory', { source, chars: content.length });
    return `✅ Ingested ${content.length} chars from ${source}`;
  } catch (err) {
    console.error('[add_to_memory] Error:', err);
    return `⚠️ Failed to ingest ${source} (Tier 2 degraded)`;
  }
}

/**
 * save_data — Save structured data to Supabase
 * Usage: save_data("user_preference", {theme: "dark"})
 */
export async function saveData(key: string, value: any): Promise<string> {
  try {
    await storeValue(key, value, typeof value === 'string' ? 'text' : 'json');
    await logActivity('save_data', { key });
    return `✅ Data saved: ${key}`;
  } catch (err) {
    console.error('[save_data] Error:', err);
    return `⚠️ Failed to save ${key} (Tier 3 degraded)`;
  }
}

/**
 * query_data — Query the Supabase data store
 * Usage: query_data("user_preference")
 */
export async function queryData(key: string): Promise<string> {
  try {
    const value = await getValue(key);
    return value ? `📊 ${key}: ${JSON.stringify(value)}` : `No data found for "${key}"`;
  } catch (err) {
    console.error('[query_data] Error:', err);
    return `⚠️ Query failed (Tier 3 degraded)`;
  }
}

// ════════════════════════════════════════════════════════
// AGENT LOOP (with graceful degradation)
// ════════════════════════════════════════════════════════

// Available tools registry
const tools = {
  remember_fact: rememberFact,
  recall_memory: recallMemory,
  add_to_memory: addToMemory,
  save_data: saveData,
  query_data: queryData,
};

/**
 * Main agent loop — processes every message through the three-tier memory system
 */
export async function processMessage(
  message: string,
  chatId = 'default',
  systemPrompt?: string
): Promise<{ response: string; context: any }> {
  try {
    // 1. Load memory (parallel)
    const [coreFacts, recentMessages, summary, semantic] = await Promise.allSettled([
      Tier1Memory.getCoreMemory(),
      Tier1Memory.getRecentMessages(chatId, 20),
      Tier1Memory.getSummary(chatId),
      querySemanticMemory(chatId, message),
    ]);

    const context = {
      coreFacts: coreFacts.status === 'fulfilled' ? coreFacts.value : [],
      recent: recentMessages.status === 'fulfilled' ? recentMessages.value : [],
      summary: summary.status === 'fulfilled' ? summary.value : null,
      semantic: semantic.status === 'fulfilled' ? semantic.value : { conversations: [], knowledge: [] },
    };

    // 2. Build context prompt
    const promptParts = [
      systemPrompt || 'You are KDS AI, an autonomous AI assistant for the Kings Dripping Swag platform.',
      '',
      '### CORE MEMORY',
      ...context.coreFacts.map(f => `- ${f}`),
      '',
      '### RECENT CONVERSATION',
      context.summary || '(No summary)',
      ...context.recent.map(m => `${m.role}: ${m.content}`),
      '',
      '### SEMANTIC RECALL',
      JSON.stringify(context.semantic),
      '',
      '### USER MESSAGE',
      message,
    ].filter(Boolean);

    // 3. Build response (placeholder — wire in your LLM)
    const response = placeholderResponse(promptParts.join('\n'));

    // 4. Background tasks (fire-and-forget, non-blocking)
    setImmediate(async () => {
      try {
        // Save conversation to Tier 1
        Tier1Memory.saveMessage(chatId, 'user', message);
        Tier1Memory.saveMessage(chatId, 'assistant', response);

        // Embed to Tier 2 (fire-and-forget)
        embedConversation(chatId, 'user', message);
        embedConversation(chatId, 'assistant', response);

        // Log activity to Tier 3
        logActivity('message', { chatId, length: message.length });

        // Auto-compact if > 30 messages
        const msgCount = Tier1Memory.getMessageCount(chatId);
        if (msgCount > 30) {
          const msgs = Tier1Memory.getRecentMessages(chatId, 30);
          const content = msgs.map(m => m.content).join('\n');
          Tier1Memory.saveSummary(chatId, `(Summary of ${msgCount - 20} messages: ${content.slice(0, 500)})`, 1, msgCount - 20);
          Tier1Memory.pruneMessages(chatId, 20);
        }
      } catch (err) {
        console.error('[Agent] Background error (graceful):', err);
      }
    });

    return { response, context };
  } catch (err) {
    console.error('[Agent] Critical error:', err);
    return { response: "I'm temporarily limited — some memory systems are offline. I'll still help!", context: {} };
  }
}

// ════════════════════════════════════════════════════════
// PLACEHOLDER LLM (replace with your actual LLM)
// ════════════════════════════════════════════════════════
function placeholderResponse(prompt: string): string {
  // TODO: Replace with actual LLM call (OpenAI, Anthropic, Ollama, etc.)
  const toolMatch = prompt.match(/(remember_fact|recall_memory|add_to_memory|save_data|query_data)\((.*)\)/);
  if (toolMatch) {
    return `(Tool call would execute: ${toolMatch[1]})`;
  }
  return "I'm your KDS AI assistant. Your memory system is active with three tiers. Connect me to an LLM provider to make me fully operational.";
}
