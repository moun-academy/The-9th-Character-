import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Calendar,
  CalendarDays,
  CalendarRange,
  X,
} from 'lucide-react';
import { formatDisplayDate, getToday, getCurrentWeek } from '../utils/dateUtils';

type GoalTab = 'daily' | 'weekly' | 'monthly';

const GoalsScreen: React.FC = () => {
  const {
    loading,
    dailyGoals,
    weeklyGoals,
    monthlyGoals,
    addGoal,
    toggleGoal,
    deleteGoal,
  } = useData();

  const [activeTab, setActiveTab] = useState<GoalTab>('daily');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading goals...</p>
      </div>
    );
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    await addGoal(activeTab, newGoalTitle.trim());
    setNewGoalTitle('');
    setShowAddForm(false);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Delete this goal?')) {
      await deleteGoal(goalId);
    }
  };

  const getCurrentGoals = () => {
    switch (activeTab) {
      case 'daily':
        return dailyGoals;
      case 'weekly':
        return weeklyGoals;
      case 'monthly':
        return monthlyGoals;
    }
  };

  const getDateLabel = () => {
    switch (activeTab) {
      case 'daily':
        return formatDisplayDate(getToday());
      case 'weekly':
        return `Week ${getCurrentWeek().split('-W')[1]}`;
      case 'monthly':
        return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const goals = getCurrentGoals();
  const completedCount = goals.filter((g) => g.completed).length;
  const completionPercentage = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="goals-screen">
      <header className="screen-header">
        <h1>Goals</h1>
        <button className="btn-icon" onClick={() => setShowAddForm(true)}>
          <Plus size={24} />
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <Calendar size={18} />
          <span>Daily</span>
        </button>
        <button
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <CalendarDays size={18} />
          <span>Weekly</span>
        </button>
        <button
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <CalendarRange size={18} />
          <span>Monthly</span>
        </button>
      </div>

      {/* Date Label */}
      <div className="date-label">
        {getDateLabel()}
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="goals-summary">
          <div className="summary-text">
            {completedCount} of {goals.length} completed ({completionPercentage}%)
          </div>
          <div className="summary-bar">
            <div
              className="summary-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Goal Form */}
      {showAddForm && (
        <section className="add-form-section">
          <form onSubmit={handleAddGoal} className="add-goal-form">
            <div className="form-header">
              <h3>New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Goal</h3>
              <button type="button" className="btn-icon" onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="What do you want to achieve?"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="btn-primary">
              Add Goal
            </button>
          </form>
        </section>
      )}

      {/* Goals List */}
      <section className="goals-list-section">
        {goals.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab} goals yet.</p>
            <p>Set your intentions and track your progress.</p>
            <button className="btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={20} /> Add Goal
            </button>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`goal-card ${goal.completed ? 'completed' : ''}`}
              >
                <div
                  className="goal-main"
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div className="goal-check">
                    {goal.completed ? (
                      <CheckCircle size={24} className="completed" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </div>
                  <span className="goal-title">{goal.title}</span>
                </div>
                <button
                  className="btn-icon delete"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tips */}
      <section className="tips-section">
        <div className="tips-card">
          <h3>Goal Setting Tips</h3>
          <ul>
            <li><strong>Daily:</strong> Focus on 3-5 key tasks</li>
            <li><strong>Weekly:</strong> Set bigger milestones</li>
            <li><strong>Monthly:</strong> Think about outcomes</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default GoalsScreen;
