// Embeddings using Xenova Transformers (runs in Node.js)
const { env, pipeline } = require('@xenova/transformers');

// Disable remote model downloading, use local only
// Enable remote model downloading for dynamic semantic matching
env.allowLocalModels = false;
env.allowRemoteModels = true;

let embeddingModel = null;

async function initializeModel() {
  if (!embeddingModel) {
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingModel;
}

async function embed(text) {
  try {
    const model = await initializeModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Embedding error:', error);
    // Return a dummy embedding if model fails (to prevent crashes)
    return new Array(384).fill(0.1);
  }
}

module.exports = { embed, initializeModel };
