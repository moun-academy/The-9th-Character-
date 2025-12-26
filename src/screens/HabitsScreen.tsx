import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Plus,
  CheckCircle,
  Circle,
  Flame,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  Check,
} from 'lucide-react';

const HabitsScreen: React.FC = () => {
  const {
    loading,
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    todayHabitCompletions,
    toggleHabitCompletion,
    getHabitStreak,
  } = useData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading habits...</p>
      </div>
    );
  }

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await addHabit(newHabitName.trim(), newHabitCategory.trim() || undefined);
    setNewHabitName('');
    setNewHabitCategory('');
    setShowAddForm(false);
  };

  const handleUpdateHabit = async (habitId: string) => {
    if (!editName.trim()) return;

    await updateHabit(habitId, {
      name: editName.trim(),
      category: editCategory.trim() || undefined,
    });
    setEditingHabit(null);
    setEditName('');
    setEditCategory('');
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId);
    }
    setMenuOpen(null);
  };

  const startEditing = (habit: { id: string; name: string; category?: string }) => {
    setEditingHabit(habit.id);
    setEditName(habit.name);
    setEditCategory(habit.category || '');
    setMenuOpen(null);
  };

  const isHabitCompleted = (habitId: string) => {
    return todayHabitCompletions.some((c) => c.habitId === habitId && c.completed);
  };

  const completedCount = habits.filter((h) => isHabitCompleted(h.id)).length;
  const completionPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="habits-screen">
      <header className="screen-header">
        <h1>Habits</h1>
        <button type="button" className="btn-icon" onClick={() => setShowAddForm(true)}>
          <Plus size={24} />
        </button>
      </header>

      {/* Summary Card */}
      <section className="summary-card">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{completedCount}/{habits.length}</span>
            <span className="stat-label">Completed Today</span>
          </div>
          <div className="stat">
            <div className="progress-ring">
              <svg viewBox="0 0 36 36">
                <path
                  className="progress-ring-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="progress-ring-fill"
                  strokeDasharray={`${completionPercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="progress-value">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Add Habit Form */}
      {showAddForm && (
        <section className="add-form-section">
          <form onSubmit={handleAddHabit} className="add-habit-form">
            <div className="form-header">
              <h3>New Habit</h3>
              <button type="button" className="btn-icon" onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Habit name"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              autoFocus
              required
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Add Habit
            </button>
          </form>
        </section>
      )}

      {/* Habits List */}
      <section className="habits-list-section">
        {habits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet.</p>
            <p>Create your first habit to start building consistency.</p>
            <button className="btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={20} /> Add First Habit
            </button>
          </div>
        ) : (
          <div className="habits-list">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`habit-card ${isHabitCompleted(habit.id) ? 'completed' : ''}`}
              >
                {editingHabit === habit.id ? (
                  <div className="habit-edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-icon save"
                        onClick={() => handleUpdateHabit(habit.id)}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        className="btn-icon cancel"
                        onClick={() => setEditingHabit(null)}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="habit-main"
                      onClick={() => toggleHabitCompletion(habit.id)}
                    >
                      <div className="habit-check">
                        {isHabitCompleted(habit.id) ? (
                          <CheckCircle size={28} className="completed" />
                        ) : (
                          <Circle size={28} />
                        )}
                      </div>
                      <div className="habit-info">
                        <span className="habit-name">{habit.name}</span>
                        {habit.category && (
                          <span className="habit-category">{habit.category}</span>
                        )}
                      </div>
                    </div>
                    <div className="habit-meta">
                      <div className="habit-streak">
                        <Flame size={16} />
                        <span>{getHabitStreak(habit.id)}</span>
                      </div>
                      <button
                        className="btn-icon menu"
                        onClick={() => setMenuOpen(menuOpen === habit.id ? null : habit.id)}
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    {menuOpen === habit.id && (
                      <div className="habit-menu">
                        <button onClick={() => startEditing(habit)}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          className="delete"
                          onClick={() => handleDeleteHabit(habit.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HabitsScreen;
