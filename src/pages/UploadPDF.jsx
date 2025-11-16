// src/pages/UploadPDF.jsx - ENHANCED TEMPLATE DESIGN (FIXED)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, Loader, CheckCircle, AlertCircle, X, 
  Sparkles, Brain, Zap, Target, Award, TrendingUp, BookOpen,
  ArrowRight, Info
} from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#0FD958]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFD166]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full relative z-10"
      >
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] rounded-full text-white text-sm font-bold mb-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Processing
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-black mb-4 text-white"
          >
            Upload Your Study Material
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/70 max-w-2xl mx-auto"
          >
            Upload a PDF to extract text and generate AI-powered quizzes automatically
          </motion.p>
        </div>

        {/* Main Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-8 mb-6"
        >
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 mb-6 transition-all ${
              dragActive
                ? 'border-[#0FD958] bg-[#0FD958]/10 scale-[1.02]'
                : file
                ? 'border-[#0FD958] bg-[#0FD958]/5'
                : 'border-white/20 hover:border-[#0FD958]/50 hover:bg-white/5'
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
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#0FD958] to-[#06D6A0] flex items-center justify-center shadow-2xl">
                      <UploadCloud className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {dragActive ? 'Drop your PDF here' : 'Drag & Drop your PDF'}
                  </h3>
                  <p className="text-white/60 mb-6 text-lg">or</p>
                  
                  <label htmlFor="pdf-input">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block px-10 py-4 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] text-white rounded-2xl font-bold cursor-pointer shadow-lg hover:shadow-2xl transition-all text-lg"
                    >
                      Choose PDF File
                    </motion.div>
                  </label>
                  
                  <p className="text-xs text-white/40 mt-6">Maximum file size: 50MB • PDF format only</p>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-[#0FD958] shadow-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0FD958] to-[#06D6A0] flex items-center justify-center text-white shadow-lg">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-lg truncate">{file.name}</h4>
                        <p className="text-sm text-white/60">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle className="w-4 h-4 text-[#0FD958]" />
                          <span className="text-xs text-[#0FD958] font-semibold">File validated</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFile(null)}
                      className="p-3 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-red-400" />
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
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <Loader className="w-8 h-8 animate-spin text-[#0FD958]" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1 text-lg">Processing PDF...</h4>
                      <p className="text-sm text-white/60">
                        Extracting text and preparing quiz generation
                      </p>
                    </div>
                    <span className="text-3xl font-black text-[#0FD958]">
                      {uploadProgress}%
                    </span>
                  </div>
                  
                  <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] rounded-full shadow-lg"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Features List */}
          <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-[#0FD958]" />
              What happens next?
            </h4>
            <div className="space-y-4">
              {[
                { icon: FileText, text: "AI extracts text from your PDF", color: "from-[#667eea] to-[#764ba2]" },
                { icon: Brain, text: "Intelligent quiz generation", color: "from-[#f093fb] to-[#f5576c]" },
                { icon: Zap, text: "Ready for interactive study session", color: "from-[#0FD958] to-[#06D6A0]" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-4 text-white"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-lg">{item.text}</span>
                  <CheckCircle className="w-5 h-5 text-[#0FD958] ml-auto" />
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
                ? 'bg-gradient-to-r from-[#0FD958] to-[#06D6A0] text-white shadow-2xl hover:shadow-3xl'
                : 'bg-white/10 text-white/40 cursor-not-allowed border-2 border-white/10'
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
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Info Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-4 mb-6"
        >
          <InfoCard 
            icon={Target}
            title="Smart Analysis"
            description="AI identifies key concepts"
            color="from-[#667eea] to-[#764ba2]"
          />
          <InfoCard 
            icon={Award}
            title="Quiz Generation"
            description="Auto-create practice tests"
            color="from-[#f093fb] to-[#f5576c]"
          />
          <InfoCard 
            icon={TrendingUp}
            title="Track Progress"
            description="Monitor your improvement"
            color="from-[#0FD958] to-[#06D6A0]"
          />
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 glass rounded-full border border-white/20">
            <Info className="w-5 h-5 text-[#0FD958]" />
            <span className="text-sm text-white/70">
              Supported: PDF • Max: 50MB • Text-based PDFs only
            </span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p className="text-white/60 mb-4">Don't have a PDF? Try these options:</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/study')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all"
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Browse Sample Materials
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold transition-all"
            >
              <Brain className="w-4 h-4 inline mr-2" />
              Ask AI Assistant
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

// Info Card Component
function InfoCard({ icon: Icon, title, description, color }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass p-5 rounded-2xl border border-white/10 text-center"
    >
      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-white/60">{description}</p>
    </motion.div>
  );
}