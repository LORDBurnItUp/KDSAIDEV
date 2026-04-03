import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, getUserFromRequest } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations list - latest message per conversation partner
    const { data: conversations, error } = await supabaseServer
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
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Group by conversation partner and get latest message
    const conversationMap = new Map<string, any>();

    conversations?.forEach((message: any) => {
      const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      const partner = message.sender_id === user.id ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner: {
            id: partner.id,
            name: partner.name,
            avatar: partner.avatar,
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            created_at: message.created_at,
            sender_id: message.sender_id,
            read: message.read,
          },
          unreadCount: 0,
        });
      }

      // Count unread messages from this partner
      if (message.sender_id === partnerId && !message.read) {
        conversationMap.get(partnerId)!.unreadCount++;
      }
    });

    const conversationList = Array.from(conversationMap.values());

    return NextResponse.json({ conversations: conversationList });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiver_id, content } = await request.json();

    if (!receiver_id || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify receiver exists
    const { data: receiver, error: receiverError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', receiver_id)
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Create message
    const { data: message, error } = await supabaseServer
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        sender_id,
        receiver_id,
        sender:users!sender_id(id, name, avatar),
        receiver:users!receiver_id(id, name, avatar)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}