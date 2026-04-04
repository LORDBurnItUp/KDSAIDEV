import { processMessage, workflows } from '../../lib/agent';
import { NextRequest, NextResponse } from 'next/server';

const tools = {
  remember_fact: processMessage,
  recall_memory: processMessage,
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, chatId = 'kds-default' } = body;
  const lastMessage = messages?.[messages.length - 1]?.content || '';

  if (!lastMessage) {
    return NextResponse.json({ error: 'message required' }, { status: 400 });
  }

  const result = await processMessage(lastMessage, chatId);
  return NextResponse.json(result);
}