import { NextRequest, NextResponse } from 'next/server';
import { Tier1Memory } from '@/lib/memory/tier1-sqlite';
import { querySemanticMemory, ingestKnowledge, embedConversation } from '@/lib/memory/tier2-pinecone';
import { storeValue, getValue } from '@/lib/memory/tier3-supabase';
import { logActivity } from '@/lib/memory/tier3-supabase';

/**
 * Memory Tools API
 * POST /api/kds/memory — agent-accessible memory operations
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tool, ...params } = body;

  try {
    switch (tool) {
      case 'remember_fact': {
        // Save a fact to core memory
        Tier1Memory.saveFact(params.fact, params.category || 'general');
        logActivity('remember_fact', { fact: params.fact });
        return NextResponse.json({ success: true, fact: params.fact });
      }

      case 'recall_memory': {
        // Search core facts + semantic memory + recent messages
        const [facts, summary, recent, semantic] = await Promise.allSettled([
          Tier1Memory.getCoreMemory(),
          params.chatId ? Tier1Memory.getSummary(params.chatId) : Promise.resolve(''),
          params.chatId ? Tier1Memory.getRecentMessages(params.chatId, params.limit || 20) : Promise.resolve([]),
          params.query ? querySemanticMemory(params.chatId || '', params.query) : Promise.resolve({ conversations: [], knowledge: [] }),
        ]);
        return NextResponse.json({
          facts: facts.status === 'fulfilled' ? facts.value : [],
          summary: summary.status === 'fulfilled' ? summary.value : '',
          recent: recent.status === 'fulfilled' ? recent.value : [],
          semantic: semantic.status === 'fulfilled' ? semantic.value : {},
        });
      }

      case 'add_to_memory': {
        // Ingest content (YouTube, URLs, text) into knowledge base
        await ingestKnowledge(params.source, params.content, 500, 150);
        logActivity('add_to_memory', { source: params.source });
        return NextResponse.json({ success: true });
      }

      case 'save_data': {
        // Save structured data to Supabase
        await storeValue(params.key, params.value, params.dataType);
        logActivity('save_data', { key: params.key });
        return NextResponse.json({ success: true });
      }

      case 'query_data': {
        // Query Supabase data store
        const value = await getValue(params.key);
        return NextResponse.json({ data: value });
      }

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message, degraded: true }, { status: 500 });
  }
}

/**
 * GET /api/kds/memory?chatId=xxx&query=search
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId') || 'default';
  const query = searchParams.get('query');

  try {
    const [facts, summary, recent] = await Promise.allSettled([
      Tier1Memory.getCoreMemory(),
      Tier1Memory.getSummary(chatId),
      Tier1Memory.getRecentMessages(chatId, 20),
    ]);

    let semantic = { conversations: [], knowledge: [] };
    if (query) {
      const result = await querySemanticMemory(chatId, query);
      semantic = result.status === 'fulfilled' ? result.value : semantic;
    }

    return NextResponse.json({
      chatId,
      facts: facts.status === 'fulfilled' ? facts.value : [],
      summary: summary.status === 'fulfilled' ? summary.value : null,
      recent: recent.status === 'fulfilled' ? recent.value : [],
      semantic,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Memory system unavailable — running in degraded mode', facts: [], recent: [], semantic: {} });
  }
}