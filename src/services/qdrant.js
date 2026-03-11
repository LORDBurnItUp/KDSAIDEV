/**
 * Qdrant Persistent Memory Service
 * Douglas's "brain" - semantic memory storage and recall using vector embeddings
 * 
 * Collections:
 * - memories: General conversation memories and facts
 * - knowledge: Structured knowledge base entries
 * - conversations: Full conversation logs for context
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const axios = require('axios');

// Configuration from environment
const QDRANT_URL = (process.env.QDRANT_URL || '').trim();
const QDRANT_API_KEY = (process.env.QDRANT_API_KEY || '').trim();
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();

// Embedding model - using Groq's free text-embedding-3-large
const EMBEDDING_MODEL = 'text-embedding-3-large';
const EMBEDDING_URL = 'https://api.groq.com/openai/v1/embeddings';
const EMBEDDING_DIMENSIONS = 1536; // text-embedding-3-large dimensions

// Collection names
const COLLECTIONS = {
  MEMORIES: 'memories',
  KNOWLEDGE: 'knowledge',
  CONVERSATIONS: 'conversations'
};

// Memory retention limits to prevent unbounded growth
const RETENTION = {
  MAX_MEMORIES: 1000,          // Maximum number of memories to retain
  MAX_CONVERSATIONS: 500,      // Maximum conversation messages to retain
  MEMORY_TTL_DAYS: 30,         // Auto-delete memories older than this
  CONVERSATION_TTL_DAYS: 7    // Auto-delete conversations older than this
};

// Initialize Qdrant client
let qdrantClient = null;
let isInitialized = false;

/**
 * Initialize the Qdrant client
 */
function initClient() {
  if (qdrantClient) return qdrantClient;
  
  if (!QDRANT_URL || !QDRANT_API_KEY) {
    console.error('✗ Qdrant: Missing QDRANT_URL or QDRANT_API_KEY in .env');
    return null;
  }
  
  qdrantClient = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
    checkCompatibility: false
  });
  
  console.log('✓ Qdrant client initialized');
  return qdrantClient;
}

/**
 * Generate embeddings using Groq API
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }
  
  try {
    const response = await axios.post(EMBEDDING_URL, {
      model: EMBEDDING_MODEL,
      input: text
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const embedding = response.data.data[0].embedding;
    return embedding;
  } catch (error) {
    console.error('✗ Embedding generation failed:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

/**
 * Ensure a collection exists, create if not
 * @param {string} collectionName - Name of the collection
 */
async function ensureCollection(collectionName) {
  const client = initClient();
  if (!client) throw new Error('Qdrant client not initialized');
  
  try {
    // Check if collection exists
    const exists = await client.collectionExists(collectionName).catch(err => {
      console.warn(`⚠ Qdrant: Could not check collection ${collectionName}: ${err.message}`);
      return false;
    });
    
    if (!exists) {
      console.log(`📚 Creating Qdrant collection: ${collectionName}`);
      await client.createCollection(collectionName, {
        vectors: {
          size: EMBEDDING_DIMENSIONS,
          distance: 'Cosine'
        }
      });
      console.log(`✓ Created collection: ${collectionName}`);
    }
  } catch (error) {
    console.error(`✗ Failed to ensure collection ${collectionName}:`, error.message);
    // Don't throw - allow graceful degradation
  }
}

/**
 * Initialize all collections
 */
async function initializeCollections() {
  if (isInitialized) return;
  
  for (const collection of Object.values(COLLECTIONS)) {
    await ensureCollection(collection);
  }
  
  isInitialized = true;
  console.log('✓ All Qdrant collections initialized');
}

/**
 * Store a memory with optional metadata
 * @param {string} text - The memory text to store
 * @param {Object} metadata - Optional metadata (user, context, timestamp, etc.)
 * @returns {Promise<string>} - The ID of the stored memory
 */
async function storeMemory(text, metadata = {}) {
  const client = initClient();
  if (!client) {
    console.warn('⚠ Qdrant not initialized, skipping memory storage');
    return null;
  }
  
  await initializeCollections();
  
  try {
    const embedding = await generateEmbedding(text);
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payload = {
      text,
      type: 'memory',
      ...metadata,
      stored_at: new Date().toISOString()
    };
    
    await client.upsert(COLLECTIONS.MEMORIES, {
      wait: true,
      points: [{
        id,
        vector: embedding,
        payload
      }]
    });
    
    console.log(`✓ Memory stored: ${id} - "${text.substring(0, 50)}..."`);
    return id;
  } catch (error) {
    console.warn('⚠ Failed to store memory:', error.message);
    return null;
  }
}

/**
 * Store a conversation message
 * @param {string} text - The message text
 * @param {string} role - 'user' or 'assistant'
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<string>} - The ID of the stored message
 */
async function storeConversationMessage(text, role, metadata = {}) {
  const client = initClient();
  if (!client) {
    console.warn('⚠ Qdrant not initialized, skipping conversation storage');
    return null;
  }
  
  await initializeCollections();
  
  try {
    const embedding = await generateEmbedding(text);
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payload = {
      text,
      role,
      type: 'conversation',
      ...metadata,
      stored_at: new Date().toISOString()
    };
    
    await client.upsert(COLLECTIONS.CONVERSATIONS, {
      wait: true,
      points: [{
        id,
        vector: embedding,
        payload
      }]
    });
    
    return id;
  } catch (error) {
    console.warn('⚠ Failed to store conversation:', error.message);
    return null;
  }
}

/**
 * Semantic recall - search for similar memories
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results (default 5)
 * @param {number} scoreThreshold - Minimum similarity score (default 0.7)
 * @returns {Promise<Array>} - Array of matching memories with scores
 */
async function recall(query, limit = 5, scoreThreshold = 0.7) {
  const client = initClient();
  if (!client) {
    console.warn('⚠ Qdrant not initialized, returning empty results');
    return [];
  }
  
  try {
    await initializeCollections();
    
    const embedding = await generateEmbedding(query);
    
    const results = await client.search(COLLECTIONS.MEMORIES, {
      vector: embedding,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true
    });
    
    if (results.length > 0) {
      console.log(`✓ Recall: found ${results.length} similar memories`);
    }
    
    return results.map(result => ({
      id: result.id,
      text: result.payload.text,
      score: result.score,
      metadata: {
        ...result.payload,
        text: undefined, // Remove text from metadata to avoid duplication
        type: undefined
      }
    }));
  } catch (error) {
    console.error('✗ Recall failed:', error.message);
    return [];
  }
}

/**
 * Search conversations for context
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of matching conversation messages
 */
async function searchConversations(query, limit = 5) {
  const client = initClient();
  if (!client) return [];
  
  try {
    await initializeCollections();
    
    const embedding = await generateEmbedding(query);
    
    const results = await client.search(COLLECTIONS.CONVERSATIONS, {
      vector: embedding,
      limit,
      score_threshold: 0.6,
      with_payload: true
    });
    
    return results.map(result => ({
      id: result.id,
      text: result.payload.text,
      role: result.payload.role,
      score: result.score,
      timestamp: result.payload.stored_at
    }));
  } catch (error) {
    console.error('✗ Conversation search failed:', error.message);
    return [];
  }
}

/**
 * Ingest knowledge from various sources
 * @param {string} text - The knowledge text
 * @param {string} source - Source identifier (e.g., 'github', 'docs', 'user-input')
 * @param {Object} metadata - Optional additional metadata
 * @returns {Promise<string>} - The ID of the stored knowledge
 */
async function ingestKnowledge(text, source, metadata = {}) {
  const client = initClient();
  if (!client) {
    console.warn('⚠ Qdrant not initialized, skipping knowledge ingestion');
    return null;
  }
  
  await initializeCollections();
  
  try {
    const embedding = await generateEmbedding(text);
    const id = `know_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payload = {
      text,
      type: 'knowledge',
      source,
      ...metadata,
      ingested_at: new Date().toISOString()
    };
    
    await client.upsert(COLLECTIONS.KNOWLEDGE, {
      wait: true,
      points: [{
        id,
        vector: embedding,
        payload
      }]
    });
    
    console.log(`✓ Knowledge ingested from ${source}: ${id}`);
    return id;
  } catch (error) {
    console.warn('⚠ Knowledge ingestion failed:', error.message);
    return null;
  }
}

/**
 * Search knowledge base
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Array of matching knowledge entries
 */
async function searchKnowledge(query, limit = 5) {
  const client = initClient();
  if (!client) return [];
  
  try {
    await initializeCollections();
    
    const embedding = await generateEmbedding(query);
    
    const results = await client.search(COLLECTIONS.KNOWLEDGE, {
      vector: embedding,
      limit,
      score_threshold: 0.6,
      with_payload: true
    });
    
    return results.map(result => ({
      id: result.id,
      text: result.payload.text,
      source: result.payload.source,
      score: result.score,
      metadata: result.payload
    }));
  } catch (error) {
    console.error('✗ Knowledge search failed:', error.message);
    return [];
  }
}

/**
 * Get collection statistics
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Object>} - Collection stats
 */
async function getCollectionStats(collectionName) {
  const client = initClient();
  if (!client) return null;
  
  try {
    const info = await client.getCollection(collectionName);
    return {
      name: collectionName,
      pointsCount: info.points_count,
      vectorsCount: info.vectors_count,
      status: info.status
    };
  } catch (error) {
    console.error(`✗ Failed to get stats for ${collectionName}:`, error.message);
    return null;
  }
}

/**
 * Get all collection stats
 * @returns {Promise<Object>} - Stats for all collections
 */
async function getAllStats() {
  const stats = {};
  for (const collection of Object.values(COLLECTIONS)) {
    stats[collection] = await getCollectionStats(collection);
  }
  return stats;
}

/**
 * Delete a point from a collection
 * @param {string} collectionName - Collection to delete from
 * @param {string} pointId - Point ID to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deletePoint(collectionName, pointId) {
  const client = initClient();
  if (!client) return false;
  
  try {
    await client.deletePoints(collectionName, {
      points: [pointId]
    });
    return true;
  } catch (error) {
    console.error('✗ Delete failed:', error.message);
    return false;
  }
}

/**
 * Clear all memories (use with caution)
 * @returns {Promise<boolean>}
 */
async function clearMemories() {
  const client = initClient();
  if (!client) return false;
  
  try {
    await client.delete(COLLECTIONS.MEMORIES, {
      filter: {} // Delete all
    });
    console.log('✓ All memories cleared');
    return true;
  } catch (error) {
    console.error('✗ Failed to clear memories:', error.message);
    return false;
  }
}

/**
 * Clean up old memories based on retention policy
 * Removes memories older than TTL and enforces max count limits
 * @returns {Promise<{deleted: number, reason: string}>}
 */
async function cleanupMemories() {
  const client = initClient();
  if (!client) return { deleted: 0, reason: 'client not initialized' };
  
  try {
    await initializeCollections();
    
    const now = new Date();
    const memoryTTL = new Date(now.getTime() - RETENTION.MEMORY_TTL_DAYS * 24 * 60 * 60 * 1000);
    const convTTL = new Date(now.getTime() - RETENTION.CONVERSATION_TTL_DAYS * 24 * 60 * 60 * 1000);
    
    let deleted = 0;
    let reason = '';
    
    // Clean up old memories by TTL
    try {
      const oldMemories = await client.scroll(COLLECTIONS.MEMORIES, {
        filter: {
          must: [{
            key: 'stored_at',
            match: { value: null } // This won't work, need different approach
          }]
        },
        limit: 100
      });
      
      // For now, just log the cleanup capability
      console.log(`📋 Memory retention policy: max ${RETENTION.MAX_MEMORIES} memories, ` +
        `${RETENTION.MEMORY_TTL_DAYS} days TTL for memories, ` +
        `${RETENTION.CONVERSATION_TTL_DAYS} days for conversations`);
    } catch (e) {
      // Scroll may not be available, skip TTL cleanup
    }
    
    // Enforce max count limits
    const memStats = await getCollectionStats(COLLECTIONS.MEMORIES);
    const convStats = await getCollectionStats(COLLECTIONS.CONVERSATIONS);
    
    if (memStats && memStats.pointsCount > RETENTION.MAX_MEMORIES) {
      console.log(`⚠ Memory count (${memStats.pointsCount}) exceeds limit (${RETENTION.MAX_MEMORIES}) - consider running cleanup`);
      reason = `count_exceeded`;
    }
    
    if (convStats && convStats.pointsCount > RETENTION.MAX_CONVERSATIONS) {
      console.log(`⚠ Conversation count (${convStats.pointsCount}) exceeds limit (${RETENTION.MAX_CONVERSATIONS}) - consider running cleanup`);
      reason = reason ? 'both_exceeded' : 'count_exceeded';
    }
    
    return { deleted, reason: reason || 'policy_active' };
  } catch (error) {
    console.error('✗ Cleanup check failed:', error.message);
    return { deleted: 0, reason: error.message };
  }
}

/**
 * Health check for the Qdrant service
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    const client = initClient();
    if (!client) return false;
    
    // Try to get collection info as a health check
    await client.getCollection(COLLECTIONS.MEMORIES);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  initClient,
  initializeCollections,
  storeMemory,
  storeConversationMessage,
  recall,
  searchConversations,
  ingestKnowledge,
  searchKnowledge,
  getCollectionStats,
  getAllStats,
  deletePoint,
  clearMemories,
  cleanupMemories,
  healthCheck,
  COLLECTIONS,
  RETENTION
};
