import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Search in title, description, and tags
    const searchTerm = `%${query.trim()}%`;

    let supabaseQuery = supabase
      .from('listings')
      .select(`
        *,
        users!seller_id (
          id,
          name,
          avatar,
          email
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Also search in tags array (this is more complex in SQL)
    // For tags, we need a separate query since Supabase doesn't support array ilike directly
    const { data: tagResults, error: tagError } = await supabase
      .from('listings')
      .select(`
        *,
        users!seller_id (
          id,
          name,
          avatar,
          email
        )
      `)
      .eq('status', 'active')
      .contains('tags', [query.trim()]);

    if (tagError) {
      console.error('Error searching tags:', tagError);
    }

    const { data: textResults, error, count } = await supabaseQuery;

    if (error) {
      console.error('Error searching listings:', error);
      return NextResponse.json({ error: 'Failed to search listings' }, { status: 500 });
    }

    // Combine results and remove duplicates
    const combinedResults = [...(textResults || []), ...(tagResults || [])];
    const uniqueResults = combinedResults.filter((listing, index, self) =>
      index === self.findIndex(l => l.id === listing.id)
    );

    // Sort combined results by featured first, then by created_at
    uniqueResults.sort((a, b) => {
      if (a.featured !== b.featured) {
        return b.featured ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply pagination to combined results
    const paginatedResults = uniqueResults.slice(offset, offset + limit);

    return NextResponse.json({
      listings: paginatedResults,
      pagination: {
        page,
        limit,
        total: uniqueResults.length,
        pages: Math.ceil(uniqueResults.length / limit),
        query
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}