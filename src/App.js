import { useState } from "react";
import api from "./api";

function App() {
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);

  const uploadJD = async () => {
    const form = new FormData();
    if (jdFile) form.append("file", jdFile);
    else form.append("text", jdText);
    await api.post("/jd", form);
    alert("JD uploaded");
  };

  const uploadResumes = async () => {
    const form = new FormData();
    resumes.forEach(r => form.append("files", r));
    await api.post("/resumes", form);
    alert("Resumes uploaded");
  };

  const runMatch = async () => {
    const res = await api.get("/match");
    setResults(res.data.selected || []);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>AI Resume Screening System</h2>

      <h3>Upload Job Description</h3>
      <textarea
        placeholder="Paste JD here"
        value={jdText}
        onChange={e => setJdText(e.target.value)}
        style={{ width: "100%", height: 120 }}
      />
      <input type="file" onChange={e => setJdFile(e.target.files[0])} />
      <button onClick={uploadJD}>Save JD</button>
      iput
      

      <h3>Upload Resumes</h3>
      <input type="file" multiple onChange={e => setResumes([...e.target.files])} />
      <button onClick={uploadResumes}>Upload Resumes</button>

      <h3>Run Matching</h3>
      <button onClick={runMatch}>Match Candidates</button>

      <h3>Selected Candidates</h3>
      {results.map(r => (
        <div key={r.file} style={{ margin: "10px 0", padding: 10, border: "1px solid #ccc" }}>
          <b>{r.file}</b><br />
          Match: {r.final}% | Semantic: {r.semantic}% | Keywords: {r.keywords}%
        </div>
      ))}
    </div> 
  );
}

export default App;
