import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../api/client';

const EMOJIS = ['💧','🏃','📚','🧘','🥗','💊','✍️','🎸','💪','😴','🚶','🧹','🌞','🍵','🎯','💻','🎨','🌿','❤️','🧠'];
const COLORS = ['#52b788','#2d6a4f','#d4a853','#e07070','#7b9ef4','#c084fc','#fb923c','#38bdf8','#a3e635','#f472b6'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AddHabitModal({ habit, onClose, onSaved }) {
  const isEditing = !!habit;
  const [form, setForm] = useState({
    name: '',
    emoji: '✅',
    color: '#52b788',
    description: '',
    targetDays: [0,1,2,3,4,5,6],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        description: habit.description || '',
        targetDays: habit.targetDays || [0,1,2,3,4,5,6],
      });
    }
  }, [habit]);

  const toggleDay = (d) => setForm(f => ({
    ...f,
    targetDays: f.targetDays.includes(d)
      ? f.targetDays.filter(x => x !== d)
      : [...f.targetDays, d].sort()
  }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Please enter a habit name'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, targetDaysPerWeek: form.targetDays.length };
      if (isEditing) {
        await api.put(`/habits/${habit._id}`, payload);
      } else {
        await api.post('/habits', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontSize: 22, margin: 0 }}>{isEditing ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#fff0f0', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Preview */}
        <div className="flex items-center gap-3 p-4 rounded-xl mb-5" style={{ background: 'var(--surface2)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
               style={{ background: form.color + '25', border: `2px solid ${form.color}` }}>
            {form.emoji}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{form.name || 'Habit name'}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {form.targetDays.length === 7 ? 'Every day' : `${form.targetDays.length}x per week`}
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
          <input
            className="input-field"
            placeholder="e.g. Drink 8 glasses of water"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Emoji */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(em => (
              <button
                key={em}
                onClick={() => setForm(f => ({ ...f, emoji: em }))}
                className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                style={{
                  background: form.emoji === em ? 'var(--primary-pale)' : 'var(--surface2)',
                  border: form.emoji === em ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform"
                style={{ background: c, border: 'none', cursor: 'pointer', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }}
              >
                {form.color === c && <Check size={14} color="white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Target days */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Target days</label>
          <div className="flex gap-2">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => toggleDay(i)}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: form.targetDays.includes(i) ? 'var(--primary)' : 'var(--surface2)',
                  color: form.targetDays.includes(i) ? 'white' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                {day[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Notes <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            className="input-field"
            placeholder="Why is this habit important?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <button className="btn-primary w-full" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Habit')}
        </button>
      </div>
    </div>
  );
}
