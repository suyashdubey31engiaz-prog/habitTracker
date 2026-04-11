import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import api from '../api/client';
import AddHabitModal from '../components/AddHabitModal';

export default function ManageHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/habits');
      setHabits(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/habits/${id}`);
      setHabits(h => h.filter(x => x._id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleting(null); setConfirmDelete(null); }
  };

  // Drag handlers
  const onDragStart = (index) => { dragItem.current = index; };
  const onDragEnter = (index) => { dragOver.current = index; };
  const onDragEnd = async () => {
    const from = dragItem.current;
    const to = dragOver.current;
    if (from === null || to === null || from === to) return;

    const reordered = [...habits];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    // Update order field
    const updated = reordered.map((h, i) => ({ ...h, order: i }));
    setHabits(updated);
    dragItem.current = null;
    dragOver.current = null;

    // Persist to backend
    try {
      await api.put('/habits/reorder', {
        order: updated.map(h => ({ id: h._id, order: h.order }))
      });
    } catch (err) {
      console.error(err);
      loadHabits(); // rollback
    }
  };

  const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5 animate-fadeUp">
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Manage Habits</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {habits.length} habit{habits.length !== 1 ? 's' : ''} · drag to reorder
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          style={{ padding: '10px 16px', fontSize: 14 }}
          onClick={() => { setEditHabit(null); setShowModal(true); }}
        >
          <Plus size={17} /> New
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="card p-10 text-center animate-scaleIn">
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌱</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Start your journey</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Create your first habit and begin tracking today.
          </p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, index) => (
            <div
              key={habit._id}
              className="card p-4 animate-fadeUp"
              draggable
              onDragStart={() => onDragStart(index)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
              style={{ transition: 'opacity 0.2s', cursor: 'default' }}
            >
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <div
                  style={{ color: 'var(--border)', marginTop: 6, flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
                  title="Drag to reorder"
                >
                  <GripVertical size={18} />
                </div>

                {/* Emoji */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                     style={{ background: habit.color + '20', border: `1.5px solid ${habit.color}40` }}>
                  {habit.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{habit.name}</div>
                  {habit.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {habit.description}
                    </div>
                  )}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {DAYS_SHORT.map((d, i) => (
                      <span key={d} style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
                        background: habit.targetDays?.includes(i) ? habit.color + '25' : 'var(--surface2)',
                        color: habit.targetDays?.includes(i) ? habit.color : 'var(--text-muted)',
                        border: `1px solid ${habit.targetDays?.includes(i) ? habit.color + '40' : 'transparent'}`
                      }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditHabit(habit); setShowModal(true); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--surface2)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setConfirmDelete(habit._id)}
                    disabled={deleting === habit._id}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--surface2)', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                    {deleting === habit._id
                      ? <span className="inline-block w-4 h-4 border-2 border-red-200 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm delete */}
              {confirmDelete === habit._id && (
                <div className="mt-3 p-3 rounded-xl animate-slideDown flex items-center justify-between gap-3"
                     style={{ background: '#fff0f0', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0, flex: 1 }}>
                    Delete "{habit.name}"?
                  </p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setConfirmDelete(null)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 600, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif' }}>
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(habit._id)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: 'white', cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {habits.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl"
             style={{ background: 'var(--primary-pale)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--primary)', margin: 0, lineHeight: 1.6 }}>
            💡 <strong>Tip:</strong> Drag the <GripVertical size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> handle to reorder your habits. They appear in this order on the dashboard.
          </p>
        </div>
      )}

      {showModal && (
        <AddHabitModal
          habit={editHabit}
          onClose={() => { setShowModal(false); setEditHabit(null); }}
          onSaved={() => { setShowModal(false); setEditHabit(null); loadHabits(); }}
        />
      )}
    </div>
  );
}