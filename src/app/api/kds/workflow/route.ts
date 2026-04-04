import { NextRequest, NextResponse } from 'next/server';
import { workflows } from '@/lib/agent';
import { logActivity } from '@/lib/memory/tier3-supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { topic, channel, numVideos, guestName, guestUrl, audience, depth, sources, niche, industry, competitors, workflow } = body;

  try {
    let result;
    switch (workflow) {
      case 'youtube':
        result = await workflows.youtubeResearch({ topic, channel, numVideos: numVideos || 20 });
        break;
      case 'podcast':
        result = await workflows.podcastShowPrep({ guestName, guestUrl: guestUrl || '', topics: [] });
        break;
      case 'briefing':
        result = await workflows.executiveBriefing({ topic, audience: audience || 'executive', depth: depth || 'standard' });
        break;
      case 'newsletter':
        result = await workflows.newsletterCurator({ sources, niche, count: numVideos || 5 });
        break;
      case 'market':
        result = await workflows.marketResearch({ industry, competitors: competitors || [] });
        break;
      default:
        return NextResponse.json({ error: 'Unknown workflow' }, { status: 400 });
    }

    logActivity(`workflow_${workflow}`, { ...body });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Workflow failed', fallback: true }, { status: 500 });
  }
}