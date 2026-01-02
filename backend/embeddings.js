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
    // Handle batch embedding (array of strings)
    if (Array.isArray(text)) {
      if (text.length === 0) return [];
      const output = await model(text, { pooling: 'mean', normalize: true });
      // output.tolist() returns a nested array [batch_size, embedding_dim]
      if (output.tolist) {
        return output.tolist();
      }
      // Fallback if tolist() is not available (flattened Float32Array)
      const embeddings = [];
      const dims = output.dims ? output.dims[1] : 384; // Assuming [N, 384]
      for (let i = 0; i < text.length; i++) {
        embeddings.push(Array.from(output.data.slice(i * dims, (i + 1) * dims)));
      }
      return embeddings;
    }

    // Handle single string
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Embedding error:', error);
    // Return dummy data on error
    if (Array.isArray(text)) {
      return text.map(() => new Array(384).fill(0.1));
    }
    return new Array(384).fill(0.1);
  }
}

module.exports = { embed, initializeModel };
