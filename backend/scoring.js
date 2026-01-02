const { embed } = require('./embeddings');

function advancedNormalize(text) {
  text = text.toLowerCase();
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ');
  // Remove special characters but keep technical symbols
  text = text.replace(/[^\w\s\+\-\#\.]/g, ' ');
  return text.trim();
}

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (normA * normB);
}

function tfidfKeywordScore(jd, resume) {
  try {
    // Simple TF-IDF-like scoring using word frequency
    const jdWords = jd.split(/\s+/).filter(w => w.length > 2);
    const resumeWords = resume.split(/\s+/).filter(w => w.length > 2);

    const jdSet = new Set(jdWords);
    const resumeSet = new Set(resumeWords);

    const intersection = [...jdSet].filter(w => resumeSet.has(w)).length;
    const union = new Set([...jdSet, ...resumeSet]).size;

    return union > 0 ? intersection / union : 0.5;
  } catch (error) {
    return 0.5;
  }
}

// Helper to split text into meaningful chunks (sentences/clauses)
function splitTextIntoChunks(text) {
  if (!text) return [];
  // Split by newlines, periods, or semicolons to get distinct thoughts
  // Filter out short segments (< 20 chars) to avoid noise
  return text
    .split(/[\n\.;]+/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 20);
}

// Calculate how well the Resume covers the JD requirements
// For each JD chunk, find the BEST matching Resume chunk.
// Final score is the average of these best matches.
function calculateSemanticCoverage(jdVectors, resumeVectors) {
  if (!jdVectors.length || !resumeVectors.length) return 0;

  let totalMaxSim = 0;

  for (const jdVec of jdVectors) {
    let maxSim = 0;
    for (const resVec of resumeVectors) {
      const sim = cosineSimilarity(jdVec, resVec);
      if (sim > maxSim) maxSim = sim;
    }
    totalMaxSim += maxSim;
  }

  return totalMaxSim / jdVectors.length;
}

async function combinedScore(jdText, resumeText) {
  const jd = advancedNormalize(jdText);
  const rs = advancedNormalize(resumeText);

  // 1. Chunking
  // We split the JD into "requirements" and Resume into "claims"
  const jdChunks = splitTextIntoChunks(jdText); // Use original text for chunking to keep punctuation
  const resumeChunks = splitTextIntoChunks(resumeText);

  // Fallback if chunking fails (e.g. very short text)
  if (jdChunks.length === 0) jdChunks.push(jd);
  if (resumeChunks.length === 0) resumeChunks.push(rs);

  // 2. Batch Embedding
  // Get vectors for all chunks at once
  const jdVectors = await embed(jdChunks);
  const resumeVectors = await embed(resumeChunks);

  // 3. Semantic Coverage Score (The "GPT-Level" Accuracy)
  // This checks if *every* requirement in JD has a match in Resume
  const coverageScore = calculateSemanticCoverage(jdVectors, resumeVectors);

  // 4. Keyword Score (Backup for specific terms)
  const tfidf = tfidfKeywordScore(jd, rs);

  // Weighted combination
  // 90% Semantic Coverage (Pure AI Understanding)
  // 10% Keywords (Backup)
  const final = (
    0.90 * coverageScore +
    0.10 * tfidf
  );

  return {
    semantic: Math.round(coverageScore * 100 * 100) / 100,
    keywords: Math.round(tfidf * 100 * 100) / 100,
    final: Math.round(final * 100 * 100) / 100
  };
}

module.exports = { combinedScore };
