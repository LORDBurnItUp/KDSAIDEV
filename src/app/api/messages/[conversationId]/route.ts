import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, getUserFromRequest } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.conversationId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch messages between current user and conversation partner
    const { data: messages, error, count } = await supabaseServer
      .from('messages')
      .select(`
        id,
        content,
        read,
        created_at,
        sender_id,
        receiver_id,
        sender:users!sender_id(id, name, avatar),
        receiver:users!receiver_id(id, name, avatar)
      `, { count: 'exact' })
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Reverse to show chronological order (oldest first)
    messages?.reverse();

    return NextResponse.json({
      messages: messages || [],
      pagination: {
        offset,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/messages/[conversationId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}