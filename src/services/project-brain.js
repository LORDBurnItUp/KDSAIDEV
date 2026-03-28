/**
 * Project Brain — Per-project persistent memory for the AI assistant.
 *
 * Uses the existing Qdrant service (swagclaw_knowledge collection) to store
 * and retrieve project-level context, goals, and breakthroughs.
 *
 * Every project is identified by a unique name. On first creation the brain
 * seeds a "profile" point for the project.  All knowledge points carry
 * source_type = 'project' and a project_name tag so they can be filtered
 * independently of other knowledge.
 *
 * Usage:
 *   const brain = require('./project-brain');
 *   await brain.initProject('SWAGCLAW', 'Advanced AI agency hub');
 *   await brain.saveBreakthrough('SWAGCLAW', 'Qdrant cleanup now works!', ['qdrant','memory']);
 *   const ctx = await brain.getProjectContext('SWAGCLAW');
 */

const crypto = require('crypto');
const qdrant = require('./qdrant');

const PROJECT_COLLECTION = 'swagclaw_knowledge';

/**
 * Initialise (or re-confirm) a project in the brain.
 * Stores a profile point if one doesn't already exist.
 *
 * @param {string} projectName - Short unique project identifier
 * @param {string} description - Human-readable description of the project
 * @param {string[]} [tags]    - Optional tags for categorisation
 * @returns {Promise<string|null>} Point ID of the profile, or null on failure
 */
async function initProject(projectName, description, tags = []) {
  if (!projectName) return null;

  try {
    // Check if a profile already exists for this project
    const existing = await qdrant.searchKnowledge(
      `project profile ${projectName}`,
      3
    );
    const alreadyExists = existing.some(
      p => p.metadata?.project_name === projectName && p.metadata?.record_type === 'project_profile'
    );

    if (alreadyExists) {
      console.log(`🧠 Project brain already initialised for: ${projectName}`);
      return null;
    }

    const id = await qdrant.ingestKnowledge(
      `Project: ${projectName}\nDescription: ${description}`,
      'project-brain',
      {
        project_name: projectName,
        record_type: 'project_profile',
        tags: ['project', 'profile', ...tags],
        collection: PROJECT_COLLECTION
      }
    );

    console.log(`🧠 Project brain initialised for: ${projectName} (${id})`);
    return id;
  } catch (err) {
    console.error('✗ project-brain.initProject failed:', err.message);
    return null;
  }
}

/**
 * Save a breakthrough, decision, or important note for a project.
 *
 * @param {string}   projectName - Project this breakthrough belongs to
 * @param {string}   text        - The breakthrough / note text
 * @param {string[]} [tags]      - Optional tags
 * @returns {Promise<string|null>} Point ID, or null on failure
 */
async function saveBreakthrough(projectName, text, tags = []) {
  if (!projectName || !text) return null;

  try {
    const id = await qdrant.ingestKnowledge(text, 'project-brain', {
      project_name: projectName,
      record_type: 'breakthrough',
      tags: ['breakthrough', projectName, ...tags],
      collection: PROJECT_COLLECTION,
      saved_at: new Date().toISOString()
    });

    console.log(`💡 Breakthrough saved for ${projectName}: "${text.substring(0, 60)}..."`);
    return id;
  } catch (err) {
    console.error('✗ project-brain.saveBreakthrough failed:', err.message);
    return null;
  }
}

/**
 * Retrieve the most relevant context for a project.
 * Returns the profile + recent breakthroughs ranked by semantic similarity
 * to the project name.
 *
 * @param {string} projectName - Project to query
 * @param {number} [limit]     - Max points to return (default 10)
 * @returns {Promise<Array>}   Array of { text, record_type, tags, score }
 */
async function getProjectContext(projectName, limit = 10) {
  if (!projectName) return [];

  try {
    const results = await qdrant.searchKnowledge(projectName, limit);
    return results
      .filter(r => r.metadata?.project_name === projectName)
      .map(r => ({
        text: r.text,
        record_type: r.metadata?.record_type || 'unknown',
        tags: r.metadata?.tags || [],
        score: r.score,
        saved_at: r.metadata?.saved_at || r.metadata?.ingested_at
      }));
  } catch (err) {
    console.error('✗ project-brain.getProjectContext failed:', err.message);
    return [];
  }
}

/**
 * List all unique project names stored in the brain.
 *
 * @returns {Promise<string[]>} Sorted array of project names
 */
async function listProjects() {
  try {
    const results = await qdrant.searchKnowledge('project profile', 50);
    const names = results
      .filter(r => r.metadata?.record_type === 'project_profile')
      .map(r => r.metadata?.project_name)
      .filter(Boolean);
    return [...new Set(names)].sort();
  } catch (err) {
    console.error('✗ project-brain.listProjects failed:', err.message);
    return [];
  }
}

module.exports = {
  initProject,
  saveBreakthrough,
  getProjectContext,
  listProjects
};
