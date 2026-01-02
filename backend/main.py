from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List
from file_utils import extract_text
from scoring import combined_score
import io

app = FastAPI(title="AI ATS Resume Matcher")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory = {"jd": "", "resumes": []}

@app.get("/")
async def root():
    return {"status": "Backend is running", "service": "AI ATS Resume Matcher"}

@app.post("/jd")
async def upload_jd(text: str = Form(None), file: UploadFile = None):
    try:
        if not text and not file:
            raise HTTPException(status_code=400, detail="Provide either text or file")
        
        if file:
            memory["jd"] = extract_text(file.file, file.content_type)
        else:
            memory["jd"] = text.strip()
        
        if not memory["jd"]:
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        return {"message": "JD saved", "length": len(memory["jd"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resumes")
async def upload_resumes(files: List[UploadFile]):
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        new_count = 0
        for f in files:
            # Check if file already exists
            existing_names = [r["name"] for r in memory["resumes"]]
            if f.filename in existing_names:
                continue  # Skip duplicate files
            
            # Read file data
            file_data = await f.read()
            txt = extract_text(io.BytesIO(file_data), f.content_type)
            if txt.strip():
                memory["resumes"].append({
                    "name": f.filename,
                    "text": txt,
                    "file_data": file_data,
                    "content_type": f.content_type
                })
                new_count += 1
        
        if new_count == 0:
            raise HTTPException(status_code=400, detail="Could not extract text from any resume or all files already uploaded")
        
        return {
            "message": f"{new_count} new resume(s) added. Total: {len(memory['resumes'])} resumes",
            "count": len(memory['resumes']),
            "new_count": new_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/match")
async def match(threshold: float = 60):
    try:
        if not memory["jd"]:
            raise HTTPException(status_code=400, detail="Upload JD first")
        
        if not memory["resumes"]:
            raise HTTPException(status_code=400, detail="Upload resumes first")

        results = []
        for r in memory["resumes"]:
            s = combined_score(memory["jd"], r["text"])
            if s["final"] >= threshold:
                results.append({
                    "file": r["name"],
                    "semantic": s["semantic"],
                    "keywords": s["keywords"],
                    "skills": s.get("skills"),
                    "education": s.get("education"),
                    "experience": s.get("experience"),
                    "final": s["final"]
                })

        results = sorted(results, key=lambda x: x["final"], reverse=True)
        return {"count": len(results), "selected": results, "threshold": threshold}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{file_name}")
async def download_resume(file_name: str):
    try:
        # Find resume by name
        resume = None
        for r in memory["resumes"]:
            if r["name"] == file_name:
                resume = r
                break
        
        if not resume:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data = resume.get("file_data")
        filename = resume.get("name", "resume")
        content_type = resume.get("content_type", "application/octet-stream")
        
        if not file_data:
            raise HTTPException(status_code=404, detail="File data not available")
        
        return FileResponse(
            io.BytesIO(file_data),
            media_type=content_type,
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
