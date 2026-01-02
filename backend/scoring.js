const { embed } = require('./embeddings');

// Critical skills weights (higher = more important)
const CRITICAL_SKILLS = {
  'python': 2.0, 'java': 2.0, 'javascript': 2.0, 'sql': 2.0,
  'react': 1.8, 'node': 1.8, 'aws': 1.8, 'azure': 1.8, 'gcp': 1.8,
  'machine learning': 2.0, 'ai': 2.0, 'data science': 2.0,
  'kubernetes': 1.8, 'docker': 1.8, 'git': 1.5
};

function advancedNormalize(text) {
  text = text.toLowerCase();
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ');
  // Remove special characters but keep technical symbols
  text = text.replace(/[^\w\s\+\-\#\.]/g, ' ');
  return text.trim();
}

function extractYearsExperience(text) {
  const matches = text.toLowerCase().match(/(\d+)\+?\s*years?/g);
  if (matches) {
    const years = matches.map(m => parseInt(m));
    return Math.max(...years);
  }
  return 0;
}

function extractSkills(text) {
  text = text.toLowerCase();
  const skills = {};

  for (const [skill, weight] of Object.entries(CRITICAL_SKILLS)) {
    if (text.includes(skill)) {
      skills[skill] = weight;
    }
  }

  return skills;
}

function skillMatchScore(jdText, resumeText) {
  const jdSkills = extractSkills(jdText);
  const resumeSkills = extractSkills(resumeText);

  if (Object.keys(jdSkills).length === 0) {
    return 0.5; // Default if no skills detected
  }

  const matchedWeight = Object.entries(jdSkills)
    .filter(([skill]) => skill in resumeSkills)
    .reduce((sum, [, weight]) => sum + weight, 0);

  const totalWeight = Object.values(jdSkills).reduce((a, b) => a + b, 0);

  return Math.min(1.0, matchedWeight / totalWeight) || 0.5;
}

function educationScore(jdText, resumeText) {
  const EDUCATION_KEYWORDS = {
    'phd': 3, 'masters': 2.5, 'mba': 2.5,
    'bachelor': 2, 'btech': 2, 'bsc': 2,
    'diploma': 1, 'certification': 1.5
  };

  const jdTexts = jdText.toLowerCase();
  const resumeTexts = resumeText.toLowerCase();

  const jdEdu = Math.max(...Object.entries(EDUCATION_KEYWORDS)
    .filter(([key]) => jdTexts.includes(key))
    .map(([, weight]) => weight), 0);

  const resumeEdu = Math.max(...Object.entries(EDUCATION_KEYWORDS)
    .filter(([key]) => resumeTexts.includes(key))
    .map(([, weight]) => weight), 0);

  if (jdEdu === 0) return 0.8;
  if (resumeEdu >= jdEdu) return 1.0;
  if (resumeEdu >= jdEdu * 0.8) return 0.8;
  return 0.6;
}

function experienceScore(jdText, resumeText) {
  const jdExp = extractYearsExperience(jdText);
  const resumeExp = extractYearsExperience(resumeText);

  if (jdExp === 0) return 0.8;
  if (resumeExp >= jdExp) return 1.0;
  if (resumeExp >= jdExp * 0.7) return 0.85;
  return Math.max(0.5, resumeExp / jdExp);
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

async function combinedScore(jdText, resumeText) {
  const jd = advancedNormalize(jdText);
  const rs = advancedNormalize(resumeText);

  // Get embeddings
  const jdEmbed = await embed(jd);
  const rsEmbed = await embed(rs);

  // Calculate individual scores
  const semantic = cosineSimilarity(jdEmbed, rsEmbed);
  const tfidf = tfidfKeywordScore(jd, rs);
  const skills = skillMatchScore(jd, rs);
  const edu = educationScore(jd, rs);
  const exp = experienceScore(jd, rs);

  // Weighted combination
  const final = (
    0.35 * semantic +
    0.20 * tfidf +
    0.25 * skills +
    0.12 * edu +
    0.08 * exp
  );

  return {
    semantic: Math.round(semantic * 100 * 100) / 100,
    keywords: Math.round(tfidf * 100 * 100) / 100,
    skills: Math.round(skills * 100 * 100) / 100,
    education: Math.round(edu * 100 * 100) / 100,
    experience: Math.round(exp * 100 * 100) / 100,
    final: Math.round(final * 100 * 100) / 100
  };
}

module.exports = { combinedScore };
