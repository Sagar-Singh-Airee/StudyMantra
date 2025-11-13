// src/utils/pdfExtractor.js

// pdfjs ES modules work perfectly with Vite
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf';

// Import the worker as a Vite url
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker source
GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const strings = textContent.items
        .map(item => item.str || '')
        .join(' ');

      const cleaned = strings.replace(/\s+/g, ' ').trim();
      fullText += cleaned + '\n\n';
    }

    if (!fullText.trim()) {
      throw new Error("PDF contains no extractable text");
    }

    return fullText.trim();

  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to process PDF");
  }
}
