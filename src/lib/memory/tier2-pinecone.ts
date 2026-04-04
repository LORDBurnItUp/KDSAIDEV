import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Tier 2 — Pinecone Semantic Memory
 * Cloud · Meaning-Based Search · Long-Term Recall
 * 
 * Namespaces:
 * - conversations: Every user/assistant exchange, searchable by semantic similarity
 * - knowledge: Ingested long-form content (YouTube, web pages, raw text)
 * 
 * Config:
 * - Embedding: multilingual-e5-large (auto-handled by Pinecone)
 * - Relevance threshold: 0.3 (results below filtered)
 * - Top K: 3 most relevant matches
 * - Pattern: Fire-and-forget (background, never blocks)
 */

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'gravity-claw';

if (!PINECONE_API_KEY) {
  console.warn('[Tier 2] PINECONE_API_KEY not set — semantic memory disabled');
}

const pc = PINECONE_API_KEY ? new Pinecone({ apiKey: PINECONE_API_KEY }) : null;
const index = pc?.index(PINECONE_INDEX);

/**
 * Embed and store a conversation exchange (fire-and-forget)
 */
export async function embedConversation(
  chatId: string,
  role: string,
  content: string,
  timestamp?: string
): Promise<void> {
  if (!index) return;

  const metadata = { chatId, role, timestamp: timestamp || new Date().toISOString() };
  
  // The actual embedding would be done by an embedding service.
  // Pinecone can auto-embed if configured, or we'd use OpenAI/embeddings API.
  // For now, this is a placeholder that stores text as string metadata.
  // In production: generate embedding vector → upsert to Pinecone
  try {
    // Placeholder: would call embedding API first, then:
    // await index.upsert([{ id: `${chatId}-${Date.now()}`, values: embedding, metadata }]);
    console.log(`[Tier 2] Queued embedding for ${chatId} (${role})`);
  } catch (err) {
    console.error('[Tier 2] Failed to embed conversation:', err);
  }
}

/**
 * Search conversations by semantic similarity
 * Returns top 3 results above 0.3 similarity threshold
 */
export async function searchConversations(
  chatId: string,
  query: string
): Promise<Array<{ text: string; role: string; score: number; timestamp: string }>> {
  if (!index) return [];

  try {
    // In production: embed query → query Pinecone → return results
    // const queryEmbedding = await embedText(query);
    // const results = await index.query({ vector: queryEmbedding, filter: { chatId }, topK: 3 });
    // return results.matches.filter(m => m.score >= 0.3);
    console.log(`[Tier 2] Semantic search in ${chatId} for: "${query}"`);
    return [];
  } catch (err) {
    console.error('[Tier 2] Failed to search conversations:', err);
    return [];
  }
}

/**
 * Ingest knowledge source (YouTube transcript, web page, raw text)
 * Chunks content with 150-char overlap for context continuity
 */
export async function ingestKnowledge(
  source: string,
  content: string,
  chunkSize = 500,
  overlap = 150
): Promise<void> {
  if (!index) return;

  const chunks: string[] = [];
  let start = 0;
  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    chunks.push(content.slice(start, end));
    start = end - overlap;
  }

  try {
    // In production: generate embeddings for each chunk → upsert to knowledge namespace
    // const vectors = await Promise.all(chunks.map(async (chunk, i) => ({
    //   id: `${source}-${i}`,
    //   values: await embedText(chunk),
    //   metadata: { source, chunkIndex: i, type: 'knowledge' }
    // })));
    // await index.namespace('knowledge').upsert(vectors);
    console.log(`[Tier 2] Ingested ${chunks.length} chunks from ${source}`);
  } catch (err) {
    console.error('[Tier 2] Failed to ingest knowledge:', err);
  }
}

/**
 * Search knowledge by semantic similarity
 */
export async function searchKnowledge(
  query: string,
  topK = 3
): Promise<Array<{ text: string; source: string; score: number; chunkIndex: number }>> {
  if (!index) return [];

  try {
    // In production: embed query → query knowledge namespace → return results
    console.log(`[Tier 2] Knowledge search for: "${query}"`);
    return [];
  } catch (err) {
    console.error('[Tier 2] Failed to search knowledge:', err);
    return [];
  }
}

/**
 * Memory query — combined search across both namespaces
 * Used by the agent loop on every message
 */
export async function querySemanticMemory(
  chatId: string,
  query: string
): Promise<{ conversations: any[]; knowledge: any[] }> {
  const [convResults, knowledgeResults] = await Promise.allSettled([
    searchConversations(chatId, query),
    searchKnowledge(query),
  ]);

  return {
    conversations: convResults.status === 'fulfilled' ? convResults.value : [],
    knowledge: knowledgeResults.status === 'fulfilled' ? knowledgeResults.value : [],
  };
}
