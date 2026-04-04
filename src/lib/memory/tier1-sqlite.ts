import Database from 'better-sqlite3';
import path from 'path';

/**
 * Tier 1 — SQLite Conversation Memory
 * Local · Instant · Always Available
 * 
 * Tables:
 * - core_memory: Durable user facts (name, preferences, timezone, goals)
 * - messages: Full conversation history (role, content, timestamp)
 * - summaries: Rolling summaries of older conversations
 */

const DB_PATH = path.join(process.cwd(), 'gravity-claw.db');
const db = new Database(DB_PATH);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS core_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fact TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    message_range_start INTEGER NOT NULL,
    message_range_end INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export const Tier1Memory = {
  // Get all durable facts for system prompt injection
  getCoreMemory(): string[] {
    const rows = db.prepare('SELECT fact FROM core_memory ORDER BY id').all() as { fact: string }[];
    return rows.map(r => r.fact);
  },

  // Save a new fact
  saveFact(fact: string, category = 'general'): void {
    db.prepare('INSERT INTO core_memory (fact, category) VALUES (?, ?)').run(fact, category);
  },

  // Get last N messages for context
  getRecentMessages(chatId: string, limit = 20): Array<{ role: string; content: string }> {
    const rows = db.prepare('SELECT role, content FROM messages WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?')
      .all(chatId, limit) as { role: string; content: string }[];
    return rows.reverse();
  },

  // Save a message
  saveMessage(chatId: string, role: string, content: string): void {
    db.prepare('INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)').run(chatId, role, content);
  },

  // Get conversation summary
  getSummary(chatId: string): string | null {
    const row = db.prepare('SELECT summary FROM summaries WHERE chat_id = ? ORDER BY created_at DESC LIMIT 1').get(chatId) as { summary: string } | undefined;
    return row?.summary || null;
  },

  // Save a summary
  saveSummary(chatId: string, summary: string, rangeStart: number, rangeEnd: number): void {
    db.prepare('INSERT INTO summaries (chat_id, summary, message_range_start, message_range_end) VALUES (?, ?, ?, ?)')
      .run(chatId, summary, rangeStart, rangeEnd);
  },

  // Get message count for a chat
  getMessageCount(chatId: string): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM messages WHERE chat_id = ?').get(chatId) as { count: number } | undefined;
    return row?.count || 0;
  },

  // Prune old messages (keep last N)
  pruneMessages(chatId: string, keep: number): void {
    db.prepare('DELETE FROM messages WHERE chat_id = ? AND id NOT IN (SELECT id FROM messages WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?)')
      .run(chatId, chatId, keep);
  },

  // Get all facts by category
  getFactsByCategory(category: string): string[] {
    const rows = db.prepare('SELECT fact FROM core_memory WHERE category = ? ORDER BY id').all(category) as { fact: string }[];
    return rows.map(r => r.fact);
  },

  // Delete a fact
  deleteFact(id: number): void {
    db.prepare('DELETE FROM core_memory WHERE id = ?').run(id);
  },

  // Update a fact
  updateFact(id: number, fact: string): void {
    db.prepare('UPDATE core_memory SET fact = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(fact, id);
  },
};

export type { Tier1Memory };
