'use server';

import { createClient } from '@supabase/supabase-js';

/**
 * Tier 3 — Supabase Data Store
 * Cloud · Structured Data · Analytics & Dashboard
 * 
 * Tables:
 * - data_store: Arbitrary key-value storage (user-defined)
 * - youtube_videos: Synced video metadata (upserted daily)
 * - youtube_comments: Top comments per video
 * - youtube_comment_insights: AI-analyzed sentiment per video
 * - activity_log: Every bot action logged for dashboard
 * - cost_log: LLM API cost tracking
 */

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('[Tier 3] Supabase credentials not set — structured store disabled');
}

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

// ════════════════════════════════════════════════════════
// DATA STORE (arbitrary key-value)
// ════════════════════════════════════════════════════════
export async function storeValue(key: string, value: unknown, dataType = 'json') {
  if (!supabase) return { error: 'Supabase not configured' };
  return supabase.from('data_store').upsert({ key, value, data_type: dataType });
}

export async function getValue(key: string) {
  if (!supabase) return null;
  const { data } = await supabase.from('data_store').select('value, data_type').eq('key', key).single();
  return data ? (data.data_type === 'json' ? JSON.parse(data.value) : data.value) : null;
}

export async function deleteValue(key: string) {
  if (!supabase) return;
  return supabase.from('data_store').delete().eq('key', key);
}

// ════════════════════════════════════════════════════════
// YOUTUBE VIDEOS
// ════════════════════════════════════════════════════════
export async function upsertYouTubeVideo(video: {
  video_id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  published_at: string;
}) {
  if (!supabase) return;
  return supabase.from('youtube_videos').upsert(video, { onConflict: 'video_id' });
}

export async function getYouTubeVideos(limit = 50) {
  if (!supabase) return [];
  const { data } = await supabase.from('youtube_videos').select('*').order('published_at', { ascending: false }).limit(limit);
  return data || [];
}

// ════════════════════════════════════════════════════════
// YOUTUBE COMMENTS
// ════════════════════════════════════════════════════════
export async function storeYouTubeComment(comment: {
  video_id: string;
  author: string;
  text: string;
  like_count: number;
}) {
  if (!supabase) return;
  return supabase.from('youtube_comments').insert(comment);
}

// ════════════════════════════════════════════════════════
// YOUTUBE COMMENT INSIGHTS (AI-analyzed sentiment)
// ════════════════════════════════════════════════════════
export async function storeCommentInsight(insight: {
  video_id: string;
  doing_well: string;
  to_improve: string;
  sentiment_score: number;
  themes: string[];
}) {
  if (!supabase) return;
  return supabase.from('youtube_comment_insights').upsert(insight, { onConflict: 'video_id' });
}

// ════════════════════════════════════════════════════════
// ACTIVITY LOG (every bot action — powers dashboard)
// ════════════════════════════════════════════════════════
export async function logActivity(action: string, details: object, status = 'success') {
  if (!supabase) return;
  return supabase.from('activity_log').insert({
    action,
    details: JSON.stringify(details),
    status,
    timestamp: new Date().toISOString(),
  });
}

export async function getRecentActivity(limit = 100) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  return data || [];
}

// ════════════════════════════════════════════════════════
// COST LOG (LLM API cost tracking)
// ════════════════════════════════════════════════════════
export async function logCost(service: string, model: string, tokens: number, cost_usd: number) {
  if (!supabase) return;
  return supabase.from('cost_log').insert({
    service,
    model,
    tokens,
    cost_usd,
    timestamp: new Date().toISOString(),
  });
}

export async function getCostSummary(days = 30) {
  if (!supabase) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('cost_log')
    .select('service, model, cost_usd')
    .gte('timestamp', since.toISOString());
  
  if (!data) return null;
  const totalCost = data.reduce((sum, r) => sum + (r.cost_usd || 0), 0);
  const totalTokens = data.reduce((sum, r) => sum + (r.tokens || 0), 0);
  return { totalCost, totalTokens, entries: data };
}
