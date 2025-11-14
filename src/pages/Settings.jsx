// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Settings page for StudyMantra
 *
 * Saves preferences to localStorage under "studymantra_settings".
 * Does NOT store sensitive secrets (App Certificate). You can store App ID (optional).
 */

const STORAGE_KEY = "studymantra_settings";

const defaultSettings = {
  profile: {
    displayName: "",
    email: ""
  },
  appearance: {
    theme: "system" // "light" | "dark" | "system"
  },
  audioVideo: {
    preferredCameraId: "",
    preferredMicId: "",
    videoQuality: "720p" // "480p"|"720p"|"1080p"
  },
  notifications: {
    push: true,
    sounds: true
  },
  privacy: {
    analytics: true,
    shareRecordings: false
  },
  integrations: {
    agoraAppId: ""
  },
  shortcuts: {
    startStopSession: "Ctrl+Shift+S",
    toggleMute: "Ctrl+Shift+M"
  }
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (e) {
    console.warn("Failed to load settings, using defaults", e);
    return defaultSettings;
  }
}

function saveSettings(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings());
  const [availableDevices, setAvailableDevices] = useState({ cams: [], mics: [] });
  const [statusMsg, setStatusMsg] = useState("");

  // enumerate devices (for camera/mic choice)
  useEffect(() => {
    async function fetchDevices() {
      try {
        if (!navigator?.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(d => d.kind === "videoinput");
        const mics = devices.filter(d => d.kind === "audioinput");
        setAvailableDevices({ cams, mics });
      } catch (e) {
        console.warn("enumerateDevices failed", e);
      }
    }
    fetchDevices();
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // theme application
  useEffect(() => {
    const theme = settings.appearance.theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // system - remove and let CSS handle it
      document.documentElement.classList.remove("dark");
    }
  }, [settings.appearance.theme]);

  function update(path, value) {
    // simple deep update helper for this component
    setSettings(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
    setStatusMsg("Saved");
    setTimeout(() => setStatusMsg(""), 1200);
  }

  function resetToDefaults() {
    if (!confirm("Reset all settings to defaults? This cannot be undone.")) return;
    setSettings(defaultSettings);
    setStatusMsg("Reset to defaults");
    setTimeout(() => setStatusMsg(""), 1500);
  }

  function exportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studymantra-settings.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importSettings(evt) {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setSettings(prev => ({ ...defaultSettings, ...parsed }));
        setStatusMsg("Imported settings");
        setTimeout(() => setStatusMsg(""), 1200);
      } catch (err) {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-6 page-settings">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500">Configure StudyMantra to suit your workflow.</p>
        </div>
        <div className="text-sm text-gray-600">{statusMsg}</div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <section className="card p-4">
          <h2 className="font-semibold mb-3">Profile</h2>
          <label className="block mb-2">
            <div className="text-xs text-gray-600">Display name</div>
            <input
              className="input w-full"
              value={settings.profile.displayName}
              onChange={(e) => update("profile.displayName", e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="block mb-4">
            <div className="text-xs text-gray-600">Email (optional)</div>
            <input
              className="input w-full"
              value={settings.profile.email}
              onChange={(e) => update("profile.email", e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <h2 className="font-semibold mb-3">Appearance</h2>
          <div className="mb-4">
            <label className="block text-sm mb-2">Theme</label>
            <select
              className="input"
              value={settings.appearance.theme}
              onChange={(e) => update("appearance.theme", e.target.value)}
            >
              <option value="system">System default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Theme preference applied immediately.</p>
          </div>

          <h2 className="font-semibold mb-3">Audio & Video</h2>
          <label className="block mb-2">
            <div className="text-xs text-gray-600">Preferred camera</div>
            <select
              className="input w-full"
              value={settings.audioVideo.preferredCameraId}
              onChange={(e) => update("audioVideo.preferredCameraId", e.target.value)}
            >
              <option value="">(Default camera)</option>
              {availableDevices.cams.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>{cam.label || cam.deviceId}</option>
              ))}
            </select>
          </label>

          <label className="block mb-2">
            <div className="text-xs text-gray-600">Preferred microphone</div>
            <select
              className="input w-full"
              value={settings.audioVideo.preferredMicId}
              onChange={(e) => update("audioVideo.preferredMicId", e.target.value)}
            >
              <option value="">(Default mic)</option>
              {availableDevices.mics.map(m => (
                <option key={m.deviceId} value={m.deviceId}>{m.label || m.deviceId}</option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <div className="text-xs text-gray-600">Video quality</div>
            <select
              className="input w-full"
              value={settings.audioVideo.videoQuality}
              onChange={(e) => update("audioVideo.videoQuality", e.target.value)}
            >
              <option value="480p">480p (battery saving)</option>
              <option value="720p">720p (balanced)</option>
              <option value="1080p">1080p (best quality)</option>
            </select>
          </label>
        </section>

        {/* Right column */}
        <section className="card p-4">
          <h2 className="font-semibold mb-3">Notifications</h2>
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              className="mr-2"
              checked={settings.notifications.push}
              onChange={(e) => update("notifications.push", e.target.checked)}
            />
            Enable browser notifications
          </label>

          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={settings.notifications.sounds}
              onChange={(e) => update("notifications.sounds", e.target.checked)}
            />
            Play sound on important events (session start, someone joined)
          </label>

          <h2 className="font-semibold mb-3">Privacy & Data</h2>
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              className="mr-2"
              checked={settings.privacy.analytics}
              onChange={(e) => update("privacy.analytics", e.target.checked)}
            />
            Allow anonymous analytics
          </label>

          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              className="mr-2"
              checked={settings.privacy.shareRecordings}
              onChange={(e) => update("privacy.shareRecordings", e.target.checked)}
            />
            Allow auto-upload of session recordings (if enabled)
          </label>

          <h2 className="font-semibold mb-3">Integrations</h2>
          <p className="text-xs text-gray-600 mb-2">Agora App ID (optional, used to prefill frontend)</p>
          <input
            className="input w-full mb-3"
            value={settings.integrations.agoraAppId}
            onChange={(e) => update("integrations.agoraAppId", e.target.value)}
            placeholder="Paste Agora App ID (only App ID, NOT certificate)"
          />
          <p className="text-xs text-gray-500">Do NOT paste your App Certificate here. Keep it on the server only.</p>

          <h2 className="font-semibold mt-4 mb-2">Keyboard Shortcuts</h2>
          <label className="block mb-2">
            Start / Stop session
            <input
              className="input w-full"
              value={settings.shortcuts.startStopSession}
              onChange={(e) => update("shortcuts.startStopSession", e.target.value)}
            />
          </label>
          <label className="block mb-3">
            Toggle mute
            <input
              className="input w-full"
              value={settings.shortcuts.toggleMute}
              onChange={(e) => update("shortcuts.toggleMute", e.target.value)}
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button className="btn btn-outline" onClick={exportSettings}>Export</button>
            <label className="btn btn-outline cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={importSettings} className="hidden" />
            </label>
            <button className="btn btn-warning" onClick={resetToDefaults}>Reset to defaults</button>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold">Danger zone</h3>
            <p className="text-xs text-gray-500 mb-2">Reset all study progress and local data (this does not affect server data).</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (!confirm("Clear local app data (sessions, progress, settings) on this device?")) return;
                localStorage.clear();
                setSettings(defaultSettings);
                setStatusMsg("Local data cleared");
                setTimeout(() => setStatusMsg(""), 1200);
              }}
            >
              Clear local data
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-6 text-sm text-gray-500">
        <p>Want more settings? Tell me which features to add (recording settings, auto-join behavior, study goals sync, etc.).</p>
        <p className="mt-2"><Link to="/" className="text-blue-500">Back to home</Link></p>
      </footer>
    </div>
  );
}
