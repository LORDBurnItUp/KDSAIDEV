import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        users!seller_id (
          id,
          name,
          avatar,
          email,
          bio,
          website,
          twitter,
          telegram,
          discord
        )
      `)
      .eq('id', params.id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, category, tags, featured, status } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (featured !== undefined) updateData.featured = featured;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the listing
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('listings')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting listing:', error);
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}