import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Zap,
  Users,
  Brain,
  Target,
  ThumbsUp,
  ThumbsDown,
  Flame,
  Clock,
  Trophy,
  Plus,
  Minus,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { PRESENCE_LEVELS, PRODUCTIVITY_LEVELS } from '../services/levelsGameService';

const HomeScreen: React.FC = () => {
  const {
    loading,
    settings,
    todayVote,
    castVote,
    streakInfo,
    todayEntry,
    updateEntry,
    getFiveSecondRuleCounts,
    addFiveSecondRuleAction,
    habits,
    todayHabitCompletions,
    toggleHabitCompletion,
    dailyGoals,
    toggleGoal,
    presenceLevelProgress,
    productivityLevelProgress,
  } = useData();

  const [voteNote, setVoteNote] = useState('');
  const [showVoteNote, setShowVoteNote] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [showActionNote, setShowActionNote] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your cockpit...</p>
      </div>
    );
  }

  const fiveSecondRuleCounts = getFiveSecondRuleCounts();

  const handleVote = async (vote: 'yes' | 'no') => {
    await castVote(vote, voteNote || undefined);
    setVoteNote('');
    setShowVoteNote(false);
  };

  const handleFiveSecondRuleAction = async (category: 'social' | 'productivity' | 'presence') => {
    if (showActionNote === category && actionNote) {
      await addFiveSecondRuleAction(category, actionNote);
      setActionNote('');
      setShowActionNote(null);
    } else {
      await addFiveSecondRuleAction(category);
    }
  };

  const handleScoreChange = async (type: 'presence' | 'productivity', delta: number) => {
    const current = type === 'presence' ? (todayEntry?.presenceScore || 0) : (todayEntry?.productivityScore || 0);
    const newValue = Math.max(1, Math.min(10, current + delta));
    if (type === 'presence') {
      await updateEntry({ presenceScore: newValue });
    } else {
      await updateEntry({ productivityScore: newValue });
    }
  };

  const handleSetsChange = async (delta: number) => {
    const current = todayEntry?.deepWorkSets || 0;
    const newValue = Math.max(0, current + delta);
    await updateEntry({ deepWorkSets: newValue });
  };

  const isHabitCompleted = (habitId: string) => {
    return todayHabitCompletions.some((c) => c.habitId === habitId && c.completed);
  };

  return (
    <div className="home-screen">
      {/* 5 SECOND RULE HERO - THE MAIN FEATURE */}
      <section className="five-second-rule-hero">
        <div className="fsr-hero-card">
          <div className="fsr-countdown">5</div>
          <h1 className="fsr-title">Second Rule</h1>
          <p className="fsr-mantra">I am always 5 seconds away from getting back to the straight line.</p>

          <div className="fsr-action-buttons">
            <button
              type="button"
              className="fsr-action-btn social"
              onClick={() => handleFiveSecondRuleAction('social')}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowActionNote(showActionNote === 'social' ? null : 'social');
              }}
            >
              <Users size={28} />
              <span className="fsr-btn-label">Social</span>
              <span className="fsr-btn-count">{fiveSecondRuleCounts.social}</span>
            </button>

            <button
              type="button"
              className="fsr-action-btn productivity"
              onClick={() => handleFiveSecondRuleAction('productivity')}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowActionNote(showActionNote === 'productivity' ? null : 'productivity');
              }}
            >
              <Zap size={28} />
              <span className="fsr-btn-label">Productivity</span>
              <span className="fsr-btn-count">{fiveSecondRuleCounts.productivity}</span>
            </button>

            <button
              type="button"
              className="fsr-action-btn presence"
              onClick={() => handleFiveSecondRuleAction('presence')}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowActionNote(showActionNote === 'presence' ? null : 'presence');
              }}
            >
              <Brain size={28} />
              <span className="fsr-btn-label">Presence</span>
              <span className="fsr-btn-count">{fiveSecondRuleCounts.presence}</span>
            </button>
          </div>

          {showActionNote && (
            <div className="action-note-container">
              <input
                type="text"
                placeholder={`Note for ${showActionNote} action...`}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="action-note-input"
              />
              <button
                type="button"
                className="btn-small"
                onClick={() => handleFiveSecondRuleAction(showActionNote as 'social' | 'productivity' | 'presence')}
              >
                Add with note
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-card">
          <p className="philosophy-main">Enjoy the ride. This moment is all I have. Live it and embrace it.</p>
          <p className="philosophy-rule">The 5 second rule is my path to living on my own terms, being in the driver seat, increasing confidence, and choosing presence.</p>
          <p className="philosophy-reminder">Wherever I am, I am always 5 seconds away from getting back to the straight line.</p>
        </div>
      </section>

      {/* Identity Section */}
      <section className="identity-section">
        <div className="identity-card">
          <h2>My Identity</h2>
          <p className="identity-text">{settings?.identity}</p>

          <div className="vote-section">
            <p className="vote-question">Did I live as this person today?</p>

            {todayVote ? (
              <div className="vote-result">
                <div className={`vote-badge ${todayVote.vote}`}>
                  {todayVote.vote === 'yes' ? (
                    <>
                      <ThumbsUp size={20} /> Yes
                    </>
                  ) : (
                    <>
                      <ThumbsDown size={20} /> No
                    </>
                  )}
                </div>
                {todayVote.note && <p className="vote-note">{todayVote.note}</p>}
                <p className="vote-subtext">
                  {todayVote.vote === 'no' ? 'Realign immediately. You are always 5 seconds away.' : 'Keep the momentum going!'}
                </p>
              </div>
            ) : (
              <div className="vote-buttons">
                <button
                  type="button"
                  className="vote-btn yes"
                  onClick={() => handleVote('yes')}
                >
                  <ThumbsUp size={24} />
                  Yes
                </button>
                <button
                  type="button"
                  className="vote-btn no"
                  onClick={() => handleVote('no')}
                >
                  <ThumbsDown size={24} />
                  No
                </button>
              </div>
            )}

            {!todayVote && (
              <button
                type="button"
                className="btn-text"
                onClick={() => setShowVoteNote(!showVoteNote)}
              >
                {showVoteNote ? 'Hide note' : 'Add note'}
              </button>
            )}

            {showVoteNote && !todayVote && (
              <input
                type="text"
                placeholder="Optional note..."
                value={voteNote}
                onChange={(e) => setVoteNote(e.target.value)}
                className="vote-note-input"
              />
            )}
          </div>

          <div className="streak-info">
            <div className="streak-item">
              <Flame size={20} />
              <span>{streakInfo.currentStreak} day streak</span>
            </div>
            <div className="streak-item">
              <Trophy size={16} />
              <span>Best: {streakInfo.longestStreak}</span>
            </div>
            <div className="streak-item">
              <span>Total: {streakInfo.totalVotes}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Scores Section */}
      <section className="scores-section">
        <h2>Daily Scores</h2>

        <div className="scores-grid">
          <div className="score-card">
            <div className="score-header">
              <Brain size={24} />
              <span>Presence</span>
            </div>
            <div className="score-controls">
              <button
                type="button"
                className="score-btn"
                onClick={() => handleScoreChange('presence', -1)}
                disabled={!todayEntry?.presenceScore || todayEntry.presenceScore <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="score-value">{todayEntry?.presenceScore || '-'}</span>
              <button
                type="button"
                className="score-btn"
                onClick={() => handleScoreChange('presence', 1)}
                disabled={todayEntry?.presenceScore === 10}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="score-card">
            <div className="score-header">
              <Target size={24} />
              <span>Productivity</span>
            </div>
            <div className="score-controls">
              <button
                type="button"
                className="score-btn"
                onClick={() => handleScoreChange('productivity', -1)}
                disabled={!todayEntry?.productivityScore || todayEntry.productivityScore <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="score-value">{todayEntry?.productivityScore || '-'}</span>
              <button
                type="button"
                className="score-btn"
                onClick={() => handleScoreChange('productivity', 1)}
                disabled={todayEntry?.productivityScore === 10}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="score-card">
            <div className="score-header">
              <Clock size={24} />
              <span>Deep Work</span>
            </div>
            <div className="score-controls">
              <button
                type="button"
                className="score-btn"
                onClick={() => handleSetsChange(-1)}
                disabled={!todayEntry?.deepWorkSets || todayEntry.deepWorkSets <= 0}
              >
                <Minus size={20} />
              </button>
              <span className="score-value">{todayEntry?.deepWorkSets || 0}</span>
              <button
                type="button"
                className="score-btn"
                onClick={() => handleSetsChange(1)}
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="score-subtitle">30 min each</p>
          </div>
        </div>
      </section>

      {/* Today's Goals Section */}
      {dailyGoals.length > 0 && (
        <section className="goals-section">
          <h2>Today's Goals</h2>
          <div className="goals-list">
            {dailyGoals.map((goal) => (
              <div
                key={goal.id}
                className={`goal-item ${goal.completed ? 'completed' : ''}`}
                onClick={() => toggleGoal(goal.id)}
              >
                {goal.completed ? (
                  <CheckCircle size={20} className="goal-icon completed" />
                ) : (
                  <Circle size={20} className="goal-icon" />
                )}
                <span>{goal.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Habits Section */}
      {habits.length > 0 && (
        <section className="habits-section">
          <h2>Habits</h2>
          <div className="habits-list">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`habit-item ${isHabitCompleted(habit.id) ? 'completed' : ''}`}
                onClick={() => toggleHabitCompletion(habit.id)}
              >
                {isHabitCompleted(habit.id) ? (
                  <CheckCircle size={20} className="habit-icon completed" />
                ) : (
                  <Circle size={20} className="habit-icon" />
                )}
                <span>{habit.name}</span>
                {habit.category && <span className="habit-category">{habit.category}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Levels Games Section */}
      <section className="levels-section">
        <h2>Levels Games</h2>

        <div className="levels-grid">
          {/* Presence Level */}
          <div className="level-card presence">
            <div className="level-header">
              <Brain size={24} />
              <span>Presence Level</span>
            </div>
            <div className="level-number">{presenceLevelProgress?.currentLevel || 1}</div>
            <div className="level-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      presenceLevelProgress
                        ? Math.min(
                            100,
                            (presenceLevelProgress.daysAtCurrentLevel / presenceLevelProgress.requiredDays) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="progress-text">
                {presenceLevelProgress?.daysAtCurrentLevel || 0} / {presenceLevelProgress?.requiredDays || 7} days
              </span>
            </div>
            <p className="level-description">
              {PRESENCE_LEVELS[(presenceLevelProgress?.currentLevel || 1) - 1]?.description || 'Log presence daily'}
            </p>
            {presenceLevelProgress && presenceLevelProgress.requiredScore > 0 && (
              <p className="level-avg">
                Avg: {presenceLevelProgress.averageScore.toFixed(1)} / {presenceLevelProgress.requiredScore} required
              </p>
            )}
          </div>

          {/* Productivity Level */}
          <div className="level-card productivity">
            <div className="level-header">
              <Trophy size={24} />
              <span>Character 9 Level</span>
            </div>
            <div className="level-number">{productivityLevelProgress?.currentLevel || 1}</div>
            <div className="level-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      productivityLevelProgress
                        ? Math.min(
                            100,
                            (productivityLevelProgress.daysAtCurrentLevel / productivityLevelProgress.requiredDays) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="progress-text">
                {productivityLevelProgress?.daysAtCurrentLevel || 0} / {productivityLevelProgress?.requiredDays || 3} days
              </span>
            </div>
            <p className="level-description">
              {PRODUCTIVITY_LEVELS[(productivityLevelProgress?.currentLevel || 1) - 1]?.description || 'Build the habit'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
