import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractTextFromPDF } from '../utils/pdfExtractor';

function UploadPDF() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      toast.success('PDF selected!');
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a PDF first!');
      return;
    }

    setLoading(true);
    try {
      const extractedText = await extractTextFromPDF(file);
      
      // Save extracted text to localStorage
      localStorage.setItem('studyMaterial', extractedText);
      localStorage.setItem('pdfFileName', file.name);
      
      toast.success('PDF processed successfully!');
      navigate('/study');
    } catch (error) {
      toast.error('Failed to process PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          📄 Upload Your Study Material
        </h2>

        <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center mb-6 hover:border-blue-500 transition">
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">
            Drag and drop your PDF here or click to browse
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
          >
            Choose File
          </label>
        </div>

        {file && (
          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="font-medium">{file.name}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" />
              Processing...
            </>
          ) : (
            'Process & Continue →'
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadPDF;