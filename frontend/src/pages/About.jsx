import { useState, useEffect } from 'react';
import { Check, ChevronRight, User, Utensils, Briefcase, Heart, Target, Scale, Droplets, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

const DIET_OPTIONS = [
  { key:'veg',     label:'Vegetarian',  emoji:'🥦', desc:'No meat or seafood' },
  { key:'non_veg', label:'Non-Veg',     emoji:'🍗', desc:'All foods' },
  { key:'vegan',   label:'Vegan',       emoji:'🌱', desc:'No animal products' },
  { key:'jain',    label:'Jain',        emoji:'🙏', desc:'Strict vegetarian' },
  { key:'keto',    label:'Keto',        emoji:'🥑', desc:'High fat, low carb' },
  { key:'other',   label:'Flexible',    emoji:'🍽️', desc:'Mix of things' },
];

const OCCUPATION_OPTIONS = [
  { key:'student',    label:'Student',          emoji:'📚' },
  { key:'working',    label:'Working',           emoji:'💼' },
  { key:'freelancer', label:'Freelancer',        emoji:'💻' },
  { key:'homemaker',  label:'Homemaker',         emoji:'🏠' },
  { key:'other',      label:'Other',             emoji:'✨' },
];

const FITNESS_OPTIONS = [
  { key:'beginner',     label:'Beginner',     emoji:'🌱', desc:'Just starting out' },
  { key:'intermediate', label:'Intermediate', emoji:'🔥', desc:'Some experience' },
  { key:'advanced',     label:'Advanced',     emoji:'⚡', desc:'Very active' },
];

const HEALTH_GOAL_OPTIONS = [
  { key:'lose_weight',    label:'Lose Weight',      emoji:'⚖️' },
  { key:'build_muscle',   label:'Build Muscle',     emoji:'💪' },
  { key:'better_sleep',   label:'Better Sleep',     emoji:'😴' },
  { key:'more_energy',    label:'More Energy',      emoji:'⚡' },
  { key:'reduce_stress',  label:'Reduce Stress',    emoji:'🧘' },
  { key:'eat_healthy',    label:'Eat Healthy',      emoji:'🥗' },
  { key:'stay_active',    label:'Stay Active',      emoji:'🏃' },
  { key:'improve_focus',  label:'Improve Focus',    emoji:'🎯' },
  { key:'quit_habit',     label:'Break Bad Habits', emoji:'🚫' },
  { key:'more_water',     label:'Drink More Water', emoji:'💧' },
];

const STEPS = [
  { id:'basic',    title:'Basic Info',    icon:'👤', desc:'Tell us about you' },
  { id:'diet',     title:'Diet',          icon:'🥗', desc:'Your eating style' },
  { id:'work',     title:'Occupation',    icon:'💼', desc:'What do you do?' },
  { id:'fitness',  title:'Fitness',       icon:'💪', desc:'Your activity level' },
  { id:'goals',    title:'Health Goals',  icon:'🎯', desc:'What you want to achieve' },
  { id:'vitals',   title:'Body & Health', icon:'❤️', desc:'Optional details' },
];

export default function About() {
  const { user, login } = useAuth();
  const { isNeon, themeKey } = useTheme();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    age: user?.age || '',
    gender: user?.gender || 'prefer_not',
    city: user?.city || '',
    bio: user?.bio || '',
    diet: user?.diet || 'non_veg',
    occupation: user?.occupation || 'student',
    occupationDetail: user?.occupationDetail || '',
    fitnessLevel: user?.fitnessLevel || 'beginner',
    healthGoals: user?.healthGoals || [],
    allergies: user?.allergies?.join(', ') || '',
    waterGoal: user?.waterGoal || 8,
    sleepGoal: user?.sleepGoal || 8,
    weightKg: user?.weightKg || '',
    heightCm: user?.heightCm || '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleGoal = (key) => set('healthGoals', form.healthGoals.includes(key)
    ? form.healthGoals.filter(g => g !== key)
    : [...form.healthGoals, key]
  );

  const cardClass = isNeon ? 'card-neon' : 'card';

  const saveStep = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        waterGoal: Number(form.waterGoal),
        sleepGoal: Number(form.sleepGoal),
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const { data } = await api.put('/auth/about', payload);
      login(localStorage.getItem('ht_token'), data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      if (step < STEPS.length - 1) setStep(s => s + 1);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const bmi = form.weightKg && form.heightCm
    ? (Number(form.weightKg) / Math.pow(Number(form.heightCm) / 100, 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? { label: 'Underweight', color: '#38bdf8' }
    : bmi < 25   ? { label: 'Healthy ✅',   color: 'var(--primary)' }
    : bmi < 30   ? { label: 'Overweight',   color: 'var(--accent)' }
    : { label: 'Obese', color: 'var(--danger)' }
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      {/* Header */}
      <div className="animate-fadeUp mb-5">
        <h1 style={{ fontSize: 24, margin: 0 }} className={isNeon ? 'neon-text' : ''}>
          About You
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
          Personalize your AI coach and recommendations
        </p>
      </div>

      {/* Step progress */}
      <div className="flex gap-1 mb-5">
        {STEPS.map((s, i) => (
          <button key={s.id} onClick={() => setStep(i)}
            style={{
              flex: 1, height: 4, borderRadius: 2, border: 'none', cursor: 'pointer',
              background: i <= step ? 'var(--primary)' : 'var(--surface2)',
              transition: 'background 0.3s',
            }} />
        ))}
      </div>

      {/* Step header */}
      <div className="flex items-center gap-3 mb-4 animate-fadeUp">
        <div style={{
          width: 44, height: 44, borderRadius: 12, fontSize: 22,
          background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isNeon ? '0 0 10px var(--primary)' : 'none',
        }}>
          {STEPS[step].icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{STEPS[step].title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{STEPS[step].desc}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          {step + 1}/{STEPS.length}
        </div>
      </div>

      {/* ── STEP: Basic Info ── */}
      {step === 0 && (
        <div className={`${cardClass} p-5 animate-fadeUp space-y-4`}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Your Age</label>
            <input type="number" className="input-field mt-1.5" placeholder="e.g. 21"
              value={form.age} onChange={e => set('age', e.target.value)} min={1} max={120} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Gender</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {[{k:'male',l:'Male',e:'👨'},{k:'female',l:'Female',e:'👩'},{k:'other',l:'Other',e:'🧑'},{k:'prefer_not',l:'Prefer not to say',e:'🤐'}].map(g => (
                <button key={g.k} onClick={() => set('gender', g.k)}
                  style={{
                    flex: 1, minWidth: 100, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: form.gender === g.k ? 'var(--primary)' : 'var(--surface2)',
                    color: form.gender === g.k ? 'var(--bg)' : 'var(--text-muted)',
                    fontSize: 13, fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s',
                  }}>
                  {g.e} {g.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>City</label>
            <input className="input-field mt-1.5" placeholder="e.g. Kanpur"
              value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              About you <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea className="input-field mt-1.5" placeholder="A little about yourself..."
              value={form.bio} onChange={e => set('bio', e.target.value)}
              rows={3} style={{ resize: 'none' }} />
          </div>
        </div>
      )}

      {/* ── STEP: Diet ── */}
      {step === 1 && (
        <div className={`${cardClass} p-5 animate-fadeUp`}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            This helps us give you the right food recommendations.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DIET_OPTIONS.map(d => (
              <button key={d.key} onClick={() => set('diet', d.key)}
                style={{
                  padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: form.diet === d.key ? 'var(--primary)' : 'var(--surface2)',
                  color: form.diet === d.key ? 'var(--bg)' : 'var(--text)',
                  textAlign: 'left', transition: 'all 0.2s',
                  boxShadow: form.diet === d.key && isNeon ? '0 0 10px var(--primary)' : 'none',
                }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{d.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{d.desc}</div>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              Allergies / Intolerances <span style={{ fontWeight: 400 }}>(comma separated)</span>
            </label>
            <input className="input-field mt-1.5" placeholder="e.g. lactose, gluten, nuts"
              value={form.allergies} onChange={e => set('allergies', e.target.value)} />
          </div>
        </div>
      )}

      {/* ── STEP: Occupation ── */}
      {step === 2 && (
        <div className={`${cardClass} p-5 animate-fadeUp`}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {OCCUPATION_OPTIONS.map(o => (
              <button key={o.key} onClick={() => set('occupation', o.key)}
                style={{
                  padding: '14px 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: form.occupation === o.key ? 'var(--primary)' : 'var(--surface2)',
                  color: form.occupation === o.key ? 'var(--bg)' : 'var(--text)',
                  textAlign: 'center', transition: 'all 0.2s', fontSize: 13,
                }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{o.emoji}</div>
                {o.label}
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {form.occupation === 'student' ? 'School / College name' : 'Company / Role'}
              <span style={{ fontWeight: 400 }}> (optional)</span>
            </label>
            <input className="input-field mt-1.5"
              placeholder={form.occupation === 'student' ? 'e.g. IIT Kanpur, Class 12' : 'e.g. Software Engineer at Google'}
              value={form.occupationDetail} onChange={e => set('occupationDetail', e.target.value)} />
          </div>
        </div>
      )}

      {/* ── STEP: Fitness Level ── */}
      {step === 3 && (
        <div className={`${cardClass} p-5 animate-fadeUp`}>
          <div className="space-y-3">
            {FITNESS_OPTIONS.map(f => (
              <button key={f.key} onClick={() => set('fitnessLevel', f.key)}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: form.fitnessLevel === f.key ? 'var(--primary)' : 'var(--surface2)',
                  color: form.fitnessLevel === f.key ? 'var(--bg)' : 'var(--text)',
                  display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                  transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: 28 }}>{f.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{f.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{f.desc}</div>
                </div>
                {form.fitnessLevel === f.key && <Check size={18} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP: Health Goals ── */}
      {step === 4 && (
        <div className={`${cardClass} p-5 animate-fadeUp`}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Select all that apply
          </p>
          <div className="grid grid-cols-2 gap-2">
            {HEALTH_GOAL_OPTIONS.map(g => {
              const active = form.healthGoals.includes(g.key);
              return (
                <button key={g.key} onClick={() => toggleGoal(g.key)}
                  style={{
                    padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'var(--surface2)',
                    color: active ? 'var(--bg)' : 'var(--text)',
                    display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                    fontSize: 13, transition: 'all 0.2s',
                    boxShadow: active && isNeon ? '0 0 8px var(--primary)' : 'none',
                  }}>
                  <span style={{ fontSize: 18 }}>{g.emoji}</span>
                  <span style={{ fontWeight: active ? 700 : 400 }}>{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP: Vitals ── */}
      {step === 5 && (
        <div className={`${cardClass} p-5 animate-fadeUp space-y-4`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Weight (kg)
              </label>
              <input type="number" className="input-field mt-1.5" placeholder="e.g. 70"
                value={form.weightKg} onChange={e => set('weightKg', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Height (cm)
              </label>
              <input type="number" className="input-field mt-1.5" placeholder="e.g. 175"
                value={form.heightCm} onChange={e => set('heightCm', e.target.value)} />
            </div>
          </div>

          {/* BMI calculator */}
          {bmi && bmiCategory && (
            <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, color: bmiCategory.color }}>{bmi}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>BMI · {bmiCategory.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Body Mass Index</div>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              Daily Water Goal
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input type="range" min={4} max={20} value={form.waterGoal}
                onChange={e => set('waterGoal', Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: 60, textAlign: 'right' }}>
                {form.waterGoal} glasses
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              Sleep Goal
            </label>
            <div className="flex items-center gap-3 mt-1.5">
              <input type="range" min={4} max={12} value={form.sleepGoal}
                onChange={e => set('sleepGoal', Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: 60, textAlign: 'right' }}>
                {form.sleepGoal} hrs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
            ← Back
          </button>
        )}
        <button onClick={saveStep} disabled={saving}
          className={`btn-primary ${isNeon ? 'neon-btn' : ''}`}
          style={{ flex: 2, padding: '13px', fontSize: 15 }}>
          {saving ? '...' : saved ? '✅ Saved!' : step < STEPS.length - 1 ? 'Save & Continue →' : '✅ All Done!'}
        </button>
      </div>

      {/* Profile completion indicator */}
      <div className="mt-4 p-3 rounded-xl animate-fadeUp" style={{ background: 'var(--primary-pale)' }}>
        <p style={{ fontSize: 12, color: 'var(--primary)', margin: 0 }}>
          💡 The more you fill in, the smarter your AI coach becomes. All data stays private on your account.
        </p>
      </div>
    </div>
  );
}