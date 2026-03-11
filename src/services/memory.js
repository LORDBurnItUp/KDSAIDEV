/**
 * Second Brain - Memory Service
 * Handles long-term memory for the AI agency.
 *
 * PREREQUISITE: Supabase table 'agency_memory' must exist with schema:
 *   - key: text UNIQUE (primary key)
 *   - value: jsonb
 *   - ts: timestamptz
 */

const databaseService = require('./database');

class SecondBrain {
  constructor() {
    this.memoryTable = 'agency_memory';
    this._tableChecked = false;
  }

  /**
   * Verify the memory table exists
   */
  async _checkTable() {
    if (this._tableChecked) return true;
    const db = databaseService.getDb();
    if (!db) return false;
    try {
      // Try a simple query to verify table exists
      await db.from(this.memoryTable).select('key').limit(1);
      this._tableChecked = true;
      return true;
    } catch (err) {
      if (err.message?.includes('does not exist')) {
        console.error(`✗ Memory table '${this.memoryTable}' does not exist in Supabase`);
        console.error('✗ Please create the table or update memory.js with the correct table name');
      }
      return false;
    }
  }

  /**
   * Remember a fact
   * @param {string} key
   * @param {any} value
   */
  async remember(key, value) {
    console.log(`🧠 Remembering: ${key}`);
    const db = databaseService.getDb();
    if (!db) return false;

    // Verify table exists before attempting operation
    const tableOk = await this._checkTable();
    if (!tableOk) return false;

    try {
      const { error } = await db.from(this.memoryTable).upsert([
        { key, value, ts: new Date().toISOString() }
      ], { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('✗ Memory error:', err.message);
      return false;
    }
  }

  /**
   * Recall a fact
   * @param {string} key
   */
  async recall(key) {
    const db = databaseService.getDb();
    if (!db) return null;

    const tableOk = await this._checkTable();
    if (!tableOk) return null;

    try {
      const { data, error } = await db.from(this.memoryTable).select('value').eq('key', key).single();
      if (error || !data) return null;
      return data.value;
    } catch (err) {
      return null;
    }
  }

  /**
   * List all memories
   */
  async list() {
    const db = databaseService.getDb();
    if (!db) return [];

    const tableOk = await this._checkTable();
    if (!tableOk) return [];

    const { data } = await db.from(this.memoryTable).select('*').order('ts', { ascending: false });
    return data || [];
  }
}

module.exports = new SecondBrain();
