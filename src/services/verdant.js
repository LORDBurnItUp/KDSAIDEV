/**
 * Verdant Service — Parallel Subagent Orchestrator
 * Manages concurrent execution of specialized AI agents.
 */

const logger = require('./logger');
const openclaw = require('./openclaw');

class Verdant {
  constructor() {
    this.subagents = new Map();
  }

  /**
   * Run multiple subagents in parallel
   * @param {Array<{name: string, task: string, instructions: string}>} tasks
   */
  async executeParallel(tasks) {
    logger.ai('verdant', `⚡ Initiating SWARM: Spawning ${tasks.length} parallel sub-agents...`);
    
    const startTime = Date.now();

    const results = await Promise.all(tasks.map(async (t) => {
      try {
        logger.ai('verdant', `Subagent [${t.name}] DEPLOYED: ${t.task}`);
        
        const subagentPrompt = `You are the ${t.name} Sub-Agent.
Task: ${t.task}
Instructions: ${t.instructions || 'Execute with precision.'}

Context:
Antigravity platform is the main orchestrator. You are working in a parallel swarm.
Respond with your findings concisely.`;

        const response = await openclaw.processCommand(subagentPrompt, 'subagent');
        
        logger.success('verdant', `Subagent [${t.name}] COMPLETED task.`);
        
        return { 
          name: t.name, 
          status: 'success', 
          output: response 
        };
      } catch (err) {
        logger.error('verdant', `Subagent [${t.name}] CRITICAL FAILURE: ${err.message}`);
        return { name: t.name, status: 'failed', error: err.message };
      }
    }));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success('verdant', `🚀 Swarm execution finalized in ${duration}s. Results aggregated.`);
    
    return results;
  }
}

module.exports = new Verdant();
