import pdfplumber
import docx

def extract_text(file, content_type):
    if "pdf" in content_type:
        with pdfplumber.open(file) as pdf:
            return "\n".join([p.extract_text() or "" for p in pdf.pages])

    if "word" in content_type or "docx" in content_type:
        d = docx.Document(file)
        return "\n".join(p.text for p in d.paragraphs)

    return file.read().decode(errors="ignore")
