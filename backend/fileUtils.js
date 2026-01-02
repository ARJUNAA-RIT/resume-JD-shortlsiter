const pdfParse = require('pdfjs-dist');
const mammoth = require('mammoth');

async function extractText(buffer, contentType) {
  try {
    if (contentType.includes('pdf')) {
      return await extractPdfText(buffer);
    }

    if (contentType.includes('word') || contentType.includes('docx')) {
      return await extractDocxText(buffer);
    }

    // Plain text file
    return buffer.toString('utf-8', undefined, 'ignore');
  } catch (error) {
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

async function extractPdfText(buffer) {
  try {
    const pdf = await pdfParse(buffer);
    let text = '';
    for (let i = 1; i <= pdf.numpages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

async function extractDocxText(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
}

module.exports = { extractText };
