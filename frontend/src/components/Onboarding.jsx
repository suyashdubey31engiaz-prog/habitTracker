import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to Habitual',
    body: 'Build lasting habits, one day at a time. Track your daily progress, see your streaks, and grow consistently.',
  },
  {
    emoji: '✅',
    title: 'Check in every day',
    body: 'Tap a habit card to mark it done. Your streak grows with every consecutive day you complete it.',
  },
  {
    emoji: '📊',
    title: 'Watch your progress',
    body: 'The Stats tab shows your heatmap, charts, and per-habit breakdown so you always know how you\'re doing.',
  },
  {
    emoji: '🌿',
    title: "You're all set!",
    body: "Head to the Habits tab to add your first habit. Start small — even one habit a day changes your life.",
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8,
            borderRadius: 4,
            background: i <= step ? 'var(--primary)' : 'var(--border)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Content */}
      <div key={step} className="animate-scaleIn text-center" style={{ maxWidth: 320 }}>
        <div style={{ fontSize: 80, marginBottom: 24, lineHeight: 1 }}>{current.emoji}</div>
        <h1 style={{ fontSize: 28, marginBottom: 12, lineHeight: 1.2 }}>{current.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          {current.body}
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ position: 'absolute', bottom: 48, left: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => isLast ? onDone() : setStep(s => s + 1)}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ padding: '16px', fontSize: 16 }}
        >
          {isLast ? (
            <><Check size={20} /> Add my first habit</>
          ) : (
            <>Next <ArrowRight size={18} /></>
          )}
        </button>

        {!isLast && (
          <button onClick={onDone}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', padding: '8px' }}>
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}