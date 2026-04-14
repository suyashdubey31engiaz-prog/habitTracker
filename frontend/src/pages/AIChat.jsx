import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';
import { detectSeason } from '../context/ThemeContext';
import api from '../api/client';

const QUICK_PROMPTS = [
  { icon: '🥗', text: 'What should I eat today?' },
  { icon: '💪', text: 'Suggest a workout for my level' },
  { icon: '😴', text: 'Help me improve my sleep' },
  { icon: '🧠', text: 'Tips for better focus' },
  { icon: '💧', text: 'How much water do I need?' },
  { icon: '🌿', text: 'Which habits should I prioritize?' },
  { icon: '⚡', text: 'Quick energy boost tips' },
  { icon: '🍎', text: 'Healthy snack ideas' },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'var(--primary)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>🌿</div>
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: '18px 18px 18px 4px', padding: '12px 16px',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--text-muted)',
            animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
        <style>{`
          @keyframes typingDot {
            0%,60%,100% { transform: translateY(0); opacity: 0.4; }
            30%          { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

function Message({ msg, isNeon }) {
  const isAI = msg.role === 'assistant';
  return (
    <div className={`flex items-end gap-2 mb-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--primary)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          boxShadow: isNeon ? '0 0 8px var(--primary)' : 'none',
        }}>🌿</div>
      )}
      <div style={{
        maxWidth: '80%',
        background: isAI ? 'var(--surface2)' : 'var(--primary)',
        border: isAI ? '1px solid var(--border)' : 'none',
        borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
        padding: '10px 14px',
        color: isAI ? 'var(--text)' : 'var(--bg)',
        fontSize: 14, lineHeight: 1.6,
        boxShadow: isNeon && isAI ? `0 0 8px var(--primary)30` : 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIChat() {
  const { isNeon } = useTheme();
  const { effect: weatherEffect, tempC } = useWeather();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your Habitual AI coach 🌿\n\nI know your habits, health goals, and what's happening outside. Ask me anything — food ideas, wellness tips, habit advice, or just have a chat!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [tips, setTips] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const season = detectSeason();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const loadTips = async () => {
      try {
        const { data } = await api.post('/ai/tips', { weather: weatherEffect, season, tempC });
        setTips(data.tips || []);
      } catch {}
    };
    loadTips();
  }, []);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again! 🌿" }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported. Use Chrome.');
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(transcript);
      if (e.results[e.results.length - 1].isFinal) sendMessage(transcript);
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const speakLast = () => {
    const lastAI = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAI || !('speechSynthesis' in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(lastAI.content);
    u.lang = 'en-IN'; u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Hey! I'm your Habitual AI coach 🌿\n\nAsk me anything about health, habits, food, or wellness!" }]);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const cardClass = isNeon ? 'card-neon' : 'card';

  return (
    <div className="px-4 py-4 page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page title ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }} className={isNeon ? 'neon-text' : ''}>
            AI Coach
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Powered by Groq · {season} season
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={speakLast} title="Read aloud"
            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', color: speaking ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {speaking ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={clearChat} title="Clear chat"
            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2.2fr)', // left narrower, right wider
        gap: 16,
        alignItems: 'start',
      }}
        className="ai-grid"
      >

        {/* ── LEFT PANEL — tips + quick prompts ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Daily tips */}
          {tips.length > 0 && (
            <div className={cardClass} style={{ padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Today's Tips
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tips.map((tip, i) => (
                  <button key={i} onClick={() => sendMessage(`Tell me more: ${tip.tip}`)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '8px 10px', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{tip.emoji}</span>
                    <span style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{tip.tip}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick prompts */}
          <div className={cardClass} style={{ padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
              Quick Ask
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p.text)} disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
                    fontSize: 12, color: 'var(--text-muted)', textAlign: 'left',
                    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-pale)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Groq info badge */}
          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            ⚡ <strong>Groq AI</strong> — Fast responses, free tier<br/>
            🔒 Your data stays on your account
          </div>
        </div>

        {/* ── RIGHT PANEL — chat window ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Messages */}
          <div
            className={cardClass}
            style={{
              height: 'calc(100vh - 260px)',
              minHeight: 380,
              overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} isNeon={isNeon} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                className="input-field"
                style={{ paddingRight: 44 }}
                placeholder={listening ? '🎤 Listening...' : 'Ask anything about health, habits, food...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={loading || listening}
              />
              <button
                onClick={listening ? stopListening : startListening}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: listening ? 'var(--danger)' : 'var(--text-muted)',
                  animation: listening ? 'neonPulse 1s ease-in-out infinite' : 'none',
                }}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`btn-primary ${isNeon ? 'neon-btn' : ''}`}
              style={{ padding: '0 18px', height: 46, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: stack columns */}
      <style>{`
        @media (max-width: 680px) {
          .ai-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}