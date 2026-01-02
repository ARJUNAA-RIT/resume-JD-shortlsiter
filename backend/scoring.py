import re
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from embeddings import embed

# Critical skills weights (higher = more important)
CRITICAL_SKILLS = {
    "python": 2.0, "java": 2.0, "javascript": 2.0, "sql": 2.0,
    "react": 1.8, "node": 1.8, "aws": 1.8, "azure": 1.8, "gcp": 1.8,
    "machine learning": 2.0, "ai": 2.0, "data science": 2.0,
    "kubernetes": 1.8, "docker": 1.8, "git": 1.5
}

EXPERIENCE_KEYWORDS = {
    r"\b(\d+)\+?\s*years?": "experience",
    r"senior|lead|principal|architect": "senior",
    r"junior|intern|entry": "junior",
    r"mid[- ]level|intermediate": "mid"
}

EDUCATION_KEYWORDS = {
    "phd": 3, "masters": 2.5, "mba": 2.5,
    "bachelor": 2, "btech": 2, "bsc": 2,
    "diploma": 1, "certification": 1.5
}

def advanced_normalize(text):
    """Better text preprocessing"""
    text = text.lower()
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove special characters but keep technical symbols
    text = re.sub(r"[^\w\s\+\-\#\.]", " ", text)
    return text.strip()

def extract_years_experience(text):
    """Extract years of experience from text"""
    matches = re.findall(r"(\d+)\+?\s*years?", text.lower())
    if matches:
        return max([int(m) for m in matches])
    return 0

def extract_skills(text):
    """Extract technical skills with weights"""
    text = text.lower()
    skills = {}
    
    for skill, weight in CRITICAL_SKILLS.items():
        if skill in text:
            skills[skill] = weight
    
    return skills

def skill_match_score(jd_text, resume_text):
    """Calculate weighted skill matching score"""
    jd_skills = extract_skills(jd_text)
    resume_skills = extract_skills(resume_text)
    
    if not jd_skills:
        return 0.5  # Default if no skills detected
    
    matched_weight = sum(weight for skill, weight in jd_skills.items() 
                         if skill in resume_skills)
    total_weight = sum(jd_skills.values())
    
    return min(1.0, matched_weight / total_weight) if total_weight > 0 else 0.5

def education_score(jd_text, resume_text):
    """Calculate education level matching"""
    jd_edu = max([weight for key, weight in EDUCATION_KEYWORDS.items()
                  if key in jd_text.lower()], default=0)
    resume_edu = max([weight for key, weight in EDUCATION_KEYWORDS.items()
                      if key in resume_text.lower()], default=0)
    
    if jd_edu == 0:
        return 0.8  # If no education required, give benefit of doubt
    
    # Score based on meeting education requirement
    if resume_edu >= jd_edu:
        return 1.0
    elif resume_edu >= jd_edu * 0.8:
        return 0.8
    else:
        return 0.6

def experience_score(jd_text, resume_text):
    """Calculate experience level matching"""
    jd_exp = extract_years_experience(jd_text)
    resume_exp = extract_years_experience(resume_text)
    
    if jd_exp == 0:
        return 0.8  # If no specific years required
    
    # Penalize if underqualified, reward if overqualified slightly
    if resume_exp >= jd_exp:
        return 1.0
    elif resume_exp >= jd_exp * 0.7:
        return 0.85
    else:
        return max(0.5, resume_exp / jd_exp)

def cosine(a, b):
    """Cosine similarity between two vectors"""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float((a @ b) / (norm_a * norm_b))

def tfidf_keyword_score(jd, resume):
    """TF-IDF based keyword matching (better than basic counting)"""
    try:
        vectorizer = TfidfVectorizer(stop_words="english", lowercase=True)
        tfidf = vectorizer.fit_transform([jd, resume]).toarray()
        jd_vec, resume_vec = tfidf
        
        # Calculate similarity
        similarity = cosine(jd_vec, resume_vec)
        return min(1.0, similarity)
    except:
        return 0.5

def combined_score(jd_text, resume_text):
    """Calculate comprehensive resume matching score"""
    # Normalize texts
    jd = advanced_normalize(jd_text)
    rs = advanced_normalize(resume_text)
    
    # Calculate individual scores
    semantic = cosine(embed(jd), embed(rs))  # 0-1
    tfidf = tfidf_keyword_score(jd, rs)  # 0-1
    skills = skill_match_score(jd, rs)  # 0-1
    edu = education_score(jd, rs)  # 0-1
    exp = experience_score(jd, rs)  # 0-1
    
    # Weighted combination
    final = (
        0.35 * semantic +    # Semantic similarity (reduced from 0.7)
        0.20 * tfidf +       # TF-IDF keyword matching
        0.25 * skills +      # Weighted skill matching (new)
        0.12 * edu +         # Education level matching (new)
        0.08 * exp           # Experience level matching (new)
    )
    
    return {
        "semantic": round(semantic * 100, 2),
        "keywords": round(tfidf * 100, 2),
        "skills": round(skills * 100, 2),
        "education": round(edu * 100, 2),
        "experience": round(exp * 100, 2),
        "final": round(min(100, final * 100), 2)
    }

 