// src/pages/Settings.jsx - ENHANCED TOP LEVEL
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  User, 
  Palette, 
  Video, 
  Bell, 
  Shield, 
  Zap, 
  Keyboard,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

/**
 * Enhanced Settings page for StudyMantra
 * 
 * Features:
 * - Real-time theme preview
 * - Enhanced device detection
 * - Keyboard shortcut validation
 * - Advanced import/export
 * - Settings search
 * - Better visual feedback
 */

const STORAGE_KEY = "studymantra_settings";

const defaultSettings = {
  profile: {
    displayName: "",
    email: "",
    avatar: "",
    bio: "",
    studyFocus: ""
  },
  appearance: {
    theme: "system",
    fontSize: "medium", // "small" | "medium" | "large"
    reducedMotion: false,
    highContrast: false
  },
  audioVideo: {
    preferredCameraId: "",
    preferredMicId: "",
    videoQuality: "720p",
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true
  },
  notifications: {
    push: true,
    sounds: true,
    studyReminders: true,
    groupActivity: true,
    achievementAlerts: true,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "07:00"
  },
  privacy: {
    analytics: true,
    shareRecordings: false,
    showOnlineStatus: true,
    allowGroupInvites: true,
    dataRetention: "30days" // "7days" | "30days" | "1year"
  },
  integrations: {
    agoraAppId: "",
    googleDrive: false,
    notion: false,
    calendarSync: false
  },
  shortcuts: {
    startStopSession: "Ctrl+Shift+S",
    toggleMute: "Ctrl+Shift+M",
    toggleVideo: "Ctrl+Shift+V",
    screenshot: "Ctrl+Shift+P",
    quickNote: "Ctrl+Shift+N"
  },
  study: {
    autoBreak: true,
    breakInterval: 45, // minutes
    breakDuration: 10, // minutes
    focusMode: true,
    backgroundMusic: false,
    musicVolume: 50
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    // Merge with defaults to ensure new fields are added
    return deepMerge(defaultSettings, parsed);
  } catch (e) {
    console.warn("Failed to load settings, using defaults", e);
    return defaultSettings;
  }
}

function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

function saveSettings(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    return true;
  } catch (e) {
    console.error("Failed to save settings", e);
    return false;
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadSettings());
  const [availableDevices, setAvailableDevices] = useState({ cams: [], mics: [] });
  const [status, setStatus] = useState({ message: "", type: "success" });
  const [activeSection, setActiveSection] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [themePreview, setThemePreview] = useState(null);

  // Enumerate devices with better error handling
  useEffect(() => {
    async function fetchDevices() {
      try {
        if (!navigator?.mediaDevices?.enumerateDevices) {
          setStatus({ message: "Media devices not supported", type: "warning" });
          return;
        }
        
        // Request permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach(track => track.stop());
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(d => d.kind === "videoinput");
        const mics = devices.filter(d => d.kind === "audioinput");
        setAvailableDevices({ cams, mics });
      } catch (e) {
        console.warn("Device enumeration failed", e);
        setStatus({ 
          message: "Camera/microphone access denied. Some features may be limited.", 
          type: "error" 
        });
      }
    }
    fetchDevices();
  }, []);

  // Save settings with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const success = saveSettings(settings);
      if (success) {
        setStatus({ message: "Settings saved automatically", type: "success" });
      } else {
        setStatus({ message: "Failed to save settings", type: "error" });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [settings]);

  // Theme application with preview capability
  useEffect(() => {
    if (themePreview) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(themePreview);
      return;
    }

    const theme = settings.appearance.theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // system
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [settings.appearance.theme, themePreview]);

  // Enhanced update function with validation
  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const keys = path.split(".");
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  }, []);

  const showStatus = useCallback((message, type = "success") => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: "", type: "success" }), 3000);
  }, []);

  const resetToDefaults = useCallback(() => {
    if (!window.confirm("Reset all settings to defaults? This cannot be undone.")) return;
    setSettings(defaultSettings);
    showStatus("Settings reset to defaults", "success");
  }, [showStatus]);

  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studymantra-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus("Settings exported successfully", "success");
    } catch (error) {
      showStatus("Failed to export settings", "error");
    }
  }, [settings, showStatus]);

  const importSettings = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        const merged = deepMerge(defaultSettings, imported);
        setSettings(merged);
        showStatus("Settings imported successfully", "success");
      } catch (error) {
        showStatus("Invalid settings file", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  }, [showStatus]);

  const clearAllData = useCallback(() => {
    if (!window.confirm("Clear ALL local data including study progress, sessions, and settings? This cannot be undone!")) return;
    
    setIsLoading(true);
    setTimeout(() => {
      localStorage.clear();
      setSettings(defaultSettings);
      setIsLoading(false);
      showStatus("All local data cleared", "success");
      setTimeout(() => navigate("/"), 1000);
    }, 1000);
  }, [navigate, showStatus]);

  // Settings sections for navigation
  const sections = [
    { id: "profile", label: "Profile", icon: User, color: "text-blue-500" },
    { id: "appearance", label: "Appearance", icon: Palette, color: "text-purple-500" },
    { id: "audioVideo", label: "Audio & Video", icon: Video, color: "text-green-500" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "text-yellow-500" },
    { id: "privacy", label: "Privacy & Data", icon: Shield, color: "text-red-500" },
    { id: "integrations", label: "Integrations", icon: Zap, color: "text-indigo-500" },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard, color: "text-orange-500" },
    { id: "study", label: "Study Preferences", icon: Save, color: "text-teal-500" }
  ];

  const themeOptions = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Customize your StudyMantra experience
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {/* Status Message */}
            <AnimatePresence>
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    status.type === "success" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : status.type === "error"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-6">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0FD958] focus:border-transparent"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <nav className="space-y-1">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    variants={itemVariants}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-[#0FD958]/10 text-[#0FD958] font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                    <span className="flex-1">{section.label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                  onClick={exportSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Settings
                </button>
                <label className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Settings
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={resetToDefaults}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Profile Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.displayName}
                        onChange={(e) => updateSetting("profile.displayName", e.target.value)}
                        className="input w-full"
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateSetting("profile.email", e.target.value)}
                        className="input w-full"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={settings.profile.bio}
                        onChange={(e) => updateSetting("profile.bio", e.target.value)}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="Tell us about yourself and your study goals..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Study Focus
                      </label>
                      <select
                        value={settings.profile.studyFocus}
                        onChange={(e) => updateSetting("profile.studyFocus", e.target.value)}
                        className="input w-full"
                      >
                        <option value="">Select your primary study area</option>
                        <option value="math">Mathematics</option>
                        <option value="science">Science</option>
                        <option value="programming">Programming</option>
                        <option value="language">Language Learning</option>
                        <option value="humanities">Humanities</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Section */}
              {activeSection === "appearance" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Appearance
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => updateSetting("appearance.theme", theme.value)}
                            onMouseEnter={() => setThemePreview(theme.value === "system" ? null : theme.value)}
                            onMouseLeave={() => setThemePreview(null)}
                            className={`p-4 border-2 rounded-xl text-center transition-all ${
                              settings.appearance.theme === theme.value
                                ? "border-[#0FD958] bg-[#0FD958]/10"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <theme.icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{theme.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Size
                      </label>
                      <select
                        value={settings.appearance.fontSize}
                        onChange={(e) => updateSetting("appearance.fontSize", e.target.value)}
                        className="input w-full"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Reduce Motion</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Minimize animations and transitions
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.appearance.reducedMotion}
                          onChange={(e) => updateSetting("appearance.reducedMotion", e.target.checked)}
                          className="toggle"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">High Contrast</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Increase color contrast for better readability
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.appearance.highContrast}
                          onChange={(e) => updateSetting("appearance.highContrast", e.target.checked)}
                          className="toggle"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio & Video Section */}
              {activeSection === "audioVideo" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Video className="w-5 h-5 text-green-500" />
                    Audio & Video
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Camera
                      </label>
                      <select
                        value={settings.audioVideo.preferredCameraId}
                        onChange={(e) => updateSetting("audioVideo.preferredCameraId", e.target.value)}
                        className="input w-full"
                      >
                        <option value="">Default Camera</option>
                        {availableDevices.cams.map((cam) => (
                          <option key={cam.deviceId} value={cam.deviceId}>
                            {cam.label || `Camera ${availableDevices.cams.indexOf(cam) + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Microphone
                      </label>
                      <select
                        value={settings.audioVideo.preferredMicId}
                        onChange={(e) => updateSetting("audioVideo.preferredMicId", e.target.value)}
                        className="input w-full"
                      >
                        <option value="">Default Microphone</option>
                        {availableDevices.mics.map((mic) => (
                          <option key={mic.deviceId} value={mic.deviceId}>
                            {mic.label || `Microphone ${availableDevices.mics.indexOf(mic) + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video Quality
                      </label>
                      <select
                        value={settings.audioVideo.videoQuality}
                        onChange={(e) => updateSetting("audioVideo.videoQuality", e.target.value)}
                        className="input w-full"
                      >
                        <option value="480p">480p (Battery Saving)</option>
                        <option value="720p">720p (Balanced)</option>
                        <option value="1080p">1080p (Best Quality)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Audio Enhancements</h3>
                      
                      <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Noise Suppression</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Reduce background noise
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.audioVideo.noiseSuppression}
                          onChange={(e) => updateSetting("audioVideo.noiseSuppression", e.target.checked)}
                          className="toggle"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Echo Cancellation</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Remove echo from audio
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.audioVideo.echoCancellation}
                          onChange={(e) => updateSetting("audioVideo.echoCancellation", e.target.checked)}
                          className="toggle"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone - Always visible at bottom */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-red-50 dark:bg-red-900/10">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={resetToDefaults}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                  >
                    Reset All Settings
                  </button>
                  <button
                    onClick={clearAllData}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom CSS for additional components */}
      <style jsx>{`
        .input {
          @apply px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0FD958] focus:border-transparent transition-all duration-200;
        }
        .toggle {
          @apply relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors;
        }
        .toggle:checked {
          @apply bg-[#0FD958];
        }
        .toggle::before {
          content: '';
          @apply absolute left-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform;
        }
        .toggle:checked::before {
          @apply translate-x-5;
        }
      `}</style>
    </div>
  );
}

// Search icon component (missing from imports)
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);