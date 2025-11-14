// src/components/AgoraAssistant.jsx
import React, { useEffect, useRef, useState } from "react";
import AgoraRTM from "agora-rtm-sdk"; // install via: npm install agora-rtm-sdk
import { X, Volume2 } from "lucide-react";

/**
 * AgoraAssistant
 *
 * Props:
 * - initialText (string) : prefilled text (e.g. selected text)
 * - onClose (fn) : called when user closes assistant
 *
 * Behavior:
 * - Calls your backend at `${import.meta.env.VITE_API_BASE_URL}/api/ask`
 * - Optionally broadcasts assistant replies over an Agora RTM channel (if VITE_AGORA_APP_ID set)
 * - Provides a small TTS button to read replies
 */
export default function AgoraAssistant({ initialText = "", onClose = () => {} }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
  const APP_ID = import.meta.env.VITE_AGORA_APP_ID || "";
  const RTM_TOKEN = import.meta.env.VITE_AGORA_TOKEN || null;
  const CHANNEL = import.meta.env.VITE_AGORA_CHANNEL || "assistant_channel";

  const [messages, setMessages] = useState([
    { from: "assistant", text: "Hi — I'm the Agora Assistant. Ask me anything about the selected text or your material." }
  ]);
  const [input, setInput] = useState(initialText || "");
  const [loading, setLoading] = useState(false);
  const rtmClientRef = useRef(null);
  const channelRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    // Initialize RTM only if APP_ID is provided
    if (APP_ID) {
      try {
        const client = AgoraRTM.createInstance(APP_ID);
        rtmClientRef.current = client;
        (async () => {
          try {
            // login with a random uid for this assistant client; in real app use user id
            const uid = `assistant_${Math.floor(Math.random() * 100000)}`;
            await client.login({ uid, token: RTM_TOKEN || null });
            const ch = client.createChannel(CHANNEL);
            channelRef.current = ch;
            await ch.join();

            ch.on("ChannelMessage", (message, memberId) => {
              // message is an object: { text } according to SDK usage above (we send JSON strings)
              try {
                const payload = typeof message === "string" ? JSON.parse(message) : message;
                if (payload?.type === "assistant.reply") {
                  pushMessage({ from: "assistant", text: payload.text });
                } else if (payload?.type === "assistant.user") {
                  pushMessage({ from: "user", text: payload.text });
                } else {
                  // fallback: show raw text
                  pushMessage({ from: "system", text: typeof message === "string" ? message : JSON.stringify(message) });
                }
              } catch (err) {
                // fallback
                pushMessage({ from: "system", text: typeof message === "string" ? message : JSON.stringify(message) });
              }
            });
          } catch (err) {
            // fail silently; assistant still works locally
            console.warn("RTM init failed:", err);
          }
        })();
      } catch (err) {
        console.warn("RTM createInstance failed:", err);
      }
    }

    return () => {
      mountedRef.current = false;
      (async () => {
        try {
          if (channelRef.current) {
            await channelRef.current.leave();
            channelRef.current.removeAllListeners?.();
            channelRef.current = null;
          }
          if (rtmClientRef.current) {
            await rtmClientRef.current.logout();
            rtmClientRef.current = null;
          }
        } catch {}
      })();
    };
  }, [APP_ID, CHANNEL, RTM_TOKEN]);

  useEffect(() => {
    // If initialText is provided and input still empty, prefill it
    if (initialText && !input) setInput(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  function pushMessage(m) {
    setMessages(prev => [...prev, m]);
  }

  async function sendToServer(text) {
    if (!API_BASE) {
      pushMessage({ from: "assistant", text: "API base URL not configured. Set VITE_API_BASE_URL in .env." });
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, selectedText: initialText || "" })
      });
      const data = await resp.json();
      const reply = data.reply || "Sorry, no reply from server.";

      pushMessage({ from: "assistant", text: reply });

      // broadcast reply via RTM (so others can see assistant output)
      if (channelRef.current) {
        try {
          const payload = JSON.stringify({ type: "assistant.reply", text: reply });
          await channelRef.current.sendMessage({ text: payload });
        } catch (err) {
          // ignore
        }
      }

      // Auto speak
      // speak(reply); // You can uncomment to auto-tts

    } catch (err) {
      console.error("Assistant send error", err);
      pushMessage({ from: "assistant", text: "Error contacting server. Try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const t = input.trim();
    if (!t) return;
    pushMessage({ from: "user", text: t });
    setInput("");
    // broadcast user question to RTM
    if (channelRef.current) {
      try {
        const payload = JSON.stringify({ type: "assistant.user", text: t });
        await channelRef.current.sendMessage({ text: payload });
      } catch {}
    }
    await sendToServer(t);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] md:w-[480px] bg-white rounded-2xl shadow-2xl border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">Agora Assistant</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // read last assistant message
              const last = [...messages].reverse().find(m => m.from === "assistant");
              if (last) speak(last.text);
            }}
            title="Read last reply"
            className="p-1 rounded hover:bg-gray-100"
          >
            <Volume2 />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" title="Close">
            <X />
          </button>
        </div>
      </div>

      <div className="h-56 overflow-y-auto mb-2 bg-gray-50 p-3 rounded custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-2 rounded-lg ${m.from === "user" ? "bg-blue-600 text-white" : "bg-white border"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
          placeholder="Ask something or edit the selected text..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? "bg-gray-300 text-gray-700" : "bg-blue-600 text-white"}`}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}
