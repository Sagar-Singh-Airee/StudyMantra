// src/pages/AssistantPage.jsx
import React, { useState } from "react";
import AgoraAssistant from "../components/AgoraAssistant";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssistantPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true); // assistant visible by default

  return (
    <div className="min-h-screen p-6 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Go back"
            >
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-black">Agora Assistant</h1>
              <p className="text-sm text-gray-500">Ask questions or paste a snippet to get study help.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(v => !v)}
              className="px-4 py-2 rounded-2xl bg-white border hover:shadow"
            >
              {open ? "Hide" : "Open"} Assistant
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: instructions / quick prompts */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow">
            <h2 className="font-semibold mb-3">How to use</h2>
            <ol className="list-decimal ml-5 text-sm space-y-2 text-gray-700">
              <li>Highlight text in Study → click Ask Agora Agent.</li>
              <li>Or open this Assistant page for longer conversations.</li>
              <li>Use the microphone or TTS buttons in the widget if enabled.</li>
              <li>Assistant replies can be broadcast to your study room (if Agora is configured).</li>
            </ol>
            <hr className="my-4" />
            <h3 className="font-semibold mb-2">Quick prompts</h3>
            <div className="flex flex-col gap-2">
              <button className="text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100">Summarize the selected paragraph</button>
              <button className="text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100">Create 5 quiz questions</button>
              <button className="text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100">Explain this like I'm 5</button>
            </div>
          </div>

          {/* Right column: assistant */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow min-h-[520px] flex items-start justify-center">
              {open ? (
                // Assistant is a floating/anchored widget itself; we render it inside the page here.
                <AgoraAssistant initialText={""} onClose={() => setOpen(false)} />
              ) : (
                <div className="text-center text-gray-500">
                  <p className="mb-2">Assistant is hidden.</p>
                  <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-2xl">Open Assistant</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
