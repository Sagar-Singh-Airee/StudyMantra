// src/pages/UploadPDF.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractTextFromPDF } from '../utils/pdfExtractor';

export default function UploadPDF() {
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // When a PDF is selected
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      toast.error("Please upload a valid PDF file");
      return;
    }

    setFile(selected);
    toast.success("PDF Selected!");
  };

  // Process PDF using your extractor
  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a PDF first!");
      return;
    }

    setLoading(true);

    try {
      const text = await extractTextFromPDF(file);

      localStorage.setItem('studyMaterial', text);
      localStorage.setItem('pdfFileName', file.name);

      toast.success("PDF processed successfully!");
      navigate('/study');

    } catch (err) {
      console.error(err);

      if (err.code === 'no_text') {
        toast.error("This PDF contains no readable text (scanned/image-only).");
      } else {
        toast.error("Failed to process PDF.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* Upload Card */}
      <div className="card p-8 shadow-lg text-center">
        <UploadCloud className="w-14 h-14 mx-auto text-gray-600 mb-4" />

        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Upload Your Study Material
        </h1>
        <p className="text-gray-600 mb-6">
          Upload a PDF to extract text and generate quizzes automatically.
        </p>

        {/* Choose File Section */}
        <div className="border-2 border-dashed border-gray-300 p-8 rounded-xl mb-6 hover:border-[var(--google-blue)] transition">
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <label htmlFor="pdf-input" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <button className="btn-primary px-6 py-2">
                Choose PDF
              </button>

              <span className="text-gray-500 text-sm">
                {file ? file.name : "No file selected"}
              </span>
            </div>
          </label>
        </div>

        {/* Selected File Card */}
        {file && (
          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg shadow mb-6">
            <FileText className="w-6 h-6 text-[var(--google-blue)]" />
            <span className="text-gray-800 font-medium">{file.name}</span>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`btn-primary w-full py-3 flex items-center justify-center gap-3 ${
            (!file || loading) && 'cursor-not-allowed opacity-70'
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing PDF…
            </>
          ) : (
            <>Process & Continue →</>
          )}
        </button>
      </div>
    </div>
  );
}
