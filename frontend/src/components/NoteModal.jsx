import { useState, useEffect } from 'react';
import { X, StickyNote } from 'lucide-react';
import api from '../api/client';

export default function NoteModal({ habit, date, existingNote, onClose, onSaved }) {
  const [note, setNote] = useState(existingNote || '');
  const [loading, setLoading] = useState(false);

  // Focus textarea on open
  useEffect(() => {
    setTimeout(() => document.getElementById('note-input')?.focus(), 100);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/logs', {
        habitId: habit._id,
        date,
        completed: true,
        note: note.trim(),
      });
      onSaved(note.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxHeight: '60vh' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 22 }}>{habit.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{habit.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add a note for today</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <textarea
          id="note-input"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="How did it go? Any thoughts..."
          maxLength={280}
          rows={4}
          style={{
            width: '100%', padding: '12px 16px',
            border: '1.5px solid var(--border)', borderRadius: 12,
            fontSize: 15, background: 'var(--bg)', color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif', outline: 'none',
            resize: 'none', lineHeight: 1.5,
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
          {note.length}/280
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="btn-primary" style={{ flex: 2, padding: '12px' }}>
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}