// src/pages/UploadPDF.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Loader, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { extractTextFromPDF } from '../utils/pdfExtractor';

export default function UploadPDF() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please upload a valid PDF file");
      return;
    }

    setFile(selectedFile);
    toast.success("PDF Selected!");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a PDF first!");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const text = await extractTextFromPDF(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      localStorage.setItem('studyMaterial', text);
      localStorage.setItem('pdfFileName', file.name);

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("PDF processed successfully!");
      navigate('/study');

    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);

      if (err.code === 'no_text') {
        toast.error("This PDF contains no readable text (scanned/image-only).");
      } else {
        toast.error("Failed to process PDF.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm font-semibold mb-4 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Processing
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Upload Your Study Material
          </h1>
          <p className="text-lg text-gray-600">
            Upload a PDF to extract text and generate quizzes automatically
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 mb-6 transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-4"
                  >
                    <UploadCloud className="w-20 h-20 mx-auto text-gray-400" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {dragActive ? 'Drop your PDF here' : 'Drag & Drop your PDF'}
                  </h3>
                  <p className="text-gray-500 mb-6">or</p>
                  
                  <label htmlFor="pdf-input">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold cursor-pointer shadow-lg hover:shadow-xl transition-all"
                    >
                      Choose PDF File
                    </motion.div>
                  </label>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <div className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-lg border-2 border-green-200">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{file.name}</h4>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFile(null)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-red-600" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-4 mb-3">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Processing PDF...</h4>
                      <p className="text-sm text-gray-600">
                        Extracting text and preparing quiz generation
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  
                  <div className="relative w-full bg-white rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features List */}
          <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              What happens next?
            </h4>
            <div className="space-y-3">
              {[
                { icon: <FileText />, text: "AI extracts text from your PDF" },
                { icon: <Sparkles />, text: "Intelligent quiz generation" },
                { icon: <CheckCircle />, text: "Ready for interactive study session" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: file && !loading ? 1.02 : 1 }}
            whileTap={{ scale: file && !loading ? 0.98 : 1 }}
            onClick={handleUpload}
            disabled={loading || !file}
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 text-lg transition-all ${
              file && !loading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Processing PDF...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Process & Continue
              </>
            )}
          </motion.button>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Supported format: PDF • Max size: 50MB</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}