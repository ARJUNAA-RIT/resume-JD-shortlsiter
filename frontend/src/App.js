import { useState } from "react";
import api from "./api";
import "./App.css";

function App() {
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);
  const [threshold, setThreshold] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jdLoaded, setJdLoaded] = useState(false);
  const [resumesLoaded, setResumesLoaded] = useState(0);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const uploadJD = async () => {
    clearMessages();
    
    if (!jdText && !jdFile) {
      setError("Please enter JD text or upload a JD file");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      if (jdFile) {
        form.append("file", jdFile);
      } else {
        form.append("text", jdText);
      }
      
      const response = await api.post("/jd", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSuccess("Job description saved successfully!");
      setJdLoaded(true);
      setJdText("");
      setJdFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to save JD");
    } finally {
      setLoading(false);
    }
  };

  const uploadResumes = async () => {
    clearMessages();
    
    if (resumes.length === 0) {
      setError("Please select at least one resume file");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      resumes.forEach(r => form.append("files", r));
      
      const response = await api.post("/resumes", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSuccess(`${response.data.count} total resume(s) loaded`);
      setResumesLoaded(response.data.count);
      setResumes([]);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to upload resumes");
    } finally {
      setLoading(false);
    }
  };

  const runMatch = async () => {
    clearMessages();
    
    if (!jdLoaded) {
      setError("Please upload a job description first");
      return;
    }
    
    if (resumesLoaded === 0) {
      setError("Please upload resumes first");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get("/match", {
        params: { threshold }
      });
      
      setResults(response.data.selected || []);
      setSuccess(`Matching complete: ${response.data.count} candidate(s) matched with threshold ${threshold}%`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to run matching");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSelect = (e) => {
    setResumes([...resumes, ...e.target.files]);
  };

  const clearResumes = () => {
    setResumes([]);
    setResults([]);
    setSuccess("All resumes cleared. Upload new ones to start fresh.");
  };

  const downloadResume = (resumeName) => {
    const link = document.createElement("a");
    link.href = `http://127.0.0.1:8000/download/${encodeURIComponent(resumeName)}`;
    link.download = resumeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎯 AI Resume Screening System</h1>
        <p>Intelligent resume matching powered by AI</p>
      </header>

      {error && (
        <div className="alert alert-error">
          <span className="close" onClick={() => setError("")}>&times;</span>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="close" onClick={() => setSuccess("")}>&times;</span>
          {success}
        </div>
      )}

      <div className="card">
        <h2>📄 Upload Job Description</h2>
        <div className="section">
          <label>Paste JD Text:</label>
          <textarea
            placeholder="Paste job description here... (Required Skills, Experience, etc.)"
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            disabled={loading}
            className="textarea"
          />
        </div>
        <div className="section">
          <label>Or Upload JD File:</label>
          <input
            type="file"
            onChange={e => setJdFile(e.target.files[0])}
            disabled={loading}
            accept=".pdf,.doc,.docx,.txt"
            className="file-input"
          />
        </div>
        <button onClick={uploadJD} disabled={loading} className="button button-primary">
          {loading ? "⏳ Saving..." : "💾 Save JD"}
        </button>
        {jdLoaded && <span className="status-badge">✓ JD Loaded</span>}
      </div>

      <div className="card">
        <h2>📋 Upload Resumes</h2>
        <div className="section">
          <label>Select Resume Files (Multiple files allowed):</label>
          <input
            type="file"
            multiple
            onChange={handleResumeSelect}
            disabled={loading}
            accept=".pdf,.doc,.docx,.txt"
            className="file-input"
          />
          {resumes.length > 0 && (
            <div className="file-list">
              <p><strong>Selected files:</strong></p>
              <ul>
                {[...resumes].map((r, i) => (
                  <li key={i}>{r.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button onClick={uploadResumes} disabled={loading} className="button button-primary">
          {loading ? "⏳ Uploading..." : "📤 Upload Resumes"}
        </button>
        <button onClick={clearResumes} className="button button-secondary">
          🗑️ Clear All Resumes
        </button>
        {resumesLoaded > 0 && <span className="status-badge">✓ {resumesLoaded} Resume(s) Loaded</span>}
      </div>

      <div className="card">
        <h2>🔍 Run Matching</h2>
        <div className="section">
          <label>Match Threshold (%):</label>
          <input
            type="number"
            min="0"
            max="100"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            disabled={loading}
            className="number-input"
          />
          <small>Only show resumes with score above this threshold</small>
        </div>
        <button onClick={runMatch} disabled={loading} className="button button-primary">
          {loading ? "⏳ Matching..." : "🚀 Match Candidates"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="card">
          <h2>✅ Selected Candidates ({results.length})</h2>
          <div className="results">
            {results.map((r, index) => (
              <div key={r.file} className="result-card">
                <div className="rank">#{index + 1}</div>
                <div className="result-content">
                  <h3>{r.file}</h3>
                  <div className="scores">
                    <div className="score">
                      <span className="score-label">Overall Match:</span>
                      <span className={`score-value score-${r.final >= 80 ? 'excellent' : r.final >= 60 ? 'good' : 'fair'}`}>
                        {r.final}%
                      </span>
                    </div>
                    <div className="score">
                      <span className="score-label">Semantic:</span>
                      <span className="score-value">{r.semantic}%</span>
                    </div>
                    <div className="score">
                      <span className="score-label">Keywords:</span>
                      <span className="score-value">{r.keywords}%</span>
                    </div>
                    {r.skills && (
                      <div className="score">
                        <span className="score-label">Skills Match:</span>
                        <span className="score-value">{r.skills}%</span>
                      </div>
                    )}
                    {r.education && (
                      <div className="score">
                        <span className="score-label">Education:</span>
                        <span className="score-value">{r.education}%</span>
                      </div>
                    )}
                    {r.experience && (
                      <div className="score">
                        <span className="score-label">Experience:</span>
                        <span className="score-value">{r.experience}%</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => downloadResume(r.file)} 
                    className="button button-download"
                  >
                    ⬇️ Download Resume
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="card">
          <p className="info-text">👆 Upload JD and resumes, then click "Match Candidates" to see results</p>
        </div>
      )}
    </div>
  );
}

export default App;

