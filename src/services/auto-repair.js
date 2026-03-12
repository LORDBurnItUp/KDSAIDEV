/**
 * Auto-Repair Service — Self-Healing Intelligence
 * Monitors system errors and automatically engages Douglas AI for fixes.
 */

const logger = require('./logger');
const openclaw = require('./openclaw');

class AutoRepair {
  constructor() {
    this.active = false;
    this.repairHistory = [];
  }

  /**
   * Initialize monitoring
   */
  start() {
    if (this.active) return;
    this.active = true;
    
    logger.getHub().on('activity', async (entry) => {
      if (entry.level === 'error' && !entry.message.includes('REPAIR')) {
        await this.analyzeAndRepair(entry);
      }
    });

    logger.success('server', '🛡️ Auto-Repair System WATCHING for system instabilities.');
  }

  /**
   * Analyze an error and suggest/log a repair
   */
  async analyzeAndRepair(errorEntry) {
    logger.warn('server', `🔍 Auto-Repair engaging: Analyzing error from [${errorEntry.source}]`);
    
    const recentLogs = logger.getLog().slice(-10).map(l => `[${l.source}] ${l.message}`).join('\n');
    
    const repairPrompt = `System Error Detected:
Source: ${errorEntry.source}
Error: ${errorEntry.message}

Context (Recent Logs):
${recentLogs}

You are the Auto-Repair Sub-Agent. 
1. Identify the likely root cause.
2. Provide a 1-sentence explanation.
3. Suggest a specific fix (code-based or config-based).
4. Reply in a precise, technical manner.

Format:
REPAIR_LOG:
CAUSE: ...
FIX: ...`;

    try {
      const suggestion = await openclaw.processCommand(repairPrompt, 'repair');
      logger.success('server', `🛠️ REPAIR PROPOSAL for [${errorEntry.source}]:\n${suggestion}`);
      this.repairHistory.push({ error: errorEntry, suggestion, ts: Date.now() });
    } catch (err) {
      logger.error('server', `❌ Auto-Repair analysis failed: ${err.message}`);
    }
  }

  getStatus() {
    return { active: this.active, totalRepairs: this.repairHistory.length };
  }
}

module.exports = new AutoRepair();
