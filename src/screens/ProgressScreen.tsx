import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Brain, Zap, Clock, Trophy } from 'lucide-react';
import { PRESENCE_LEVELS, PRODUCTIVITY_LEVELS } from '../services/levelsGameService';
import { getLast7Days, getDayOfWeek } from '../utils/dateUtils';
import * as dataService from '../services/dataService';

type TimeRange = '7days' | '30days';

const ProgressScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    loading,
    presenceLevelProgress,
    productivityLevelProgress,
  } = useData();

  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [chartData, setChartData] = useState<any[]>([]);
  const [fiveSecondRuleData, setFiveSecondRuleData] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      if (!user) return;

      setLoadingCharts(true);
      try {
        const last7Days = getLast7Days();
        const startDate = last7Days[0];
        const endDate = last7Days[last7Days.length - 1];

        const [entries, actions] = await Promise.all([
          dataService.getEntriesInRange(user.uid, startDate, endDate),
          dataService.getFiveSecondRuleActionsInRange(user.uid, startDate, endDate),
        ]);

        // Build chart data
        const data = last7Days.map((date) => {
          const entry = entries.find((e) => e.date === date);
          const dayActions = actions.filter((a) => a.date === date);

          return {
            date: getDayOfWeek(date),
            fullDate: date,
            presence: entry?.presenceScore || null,
            productivity: entry?.productivityScore || null,
            sets: entry?.deepWorkSets || 0,
            social: dayActions.filter((a) => a.category === 'social').length,
            productivityActions: dayActions.filter((a) => a.category === 'productivity').length,
            presenceActions: dayActions.filter((a) => a.category === 'presence').length,
          };
        });

        setChartData(data);

        // Calculate 5SR totals for each category
        const socialTotal = actions.filter((a) => a.category === 'social').length;
        const productivityTotal = actions.filter((a) => a.category === 'productivity').length;
        const presenceTotal = actions.filter((a) => a.category === 'presence').length;

        setFiveSecondRuleData([
          { name: 'Social', value: socialTotal, color: '#3b82f6' },
          { name: 'Productivity', value: productivityTotal, color: '#10b981' },
          { name: 'Presence', value: presenceTotal, color: '#8b5cf6' },
        ]);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoadingCharts(false);
      }
    };

    loadChartData();
  }, [user, timeRange]);

  if (loading || loadingCharts) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="progress-screen">
      <header className="screen-header">
        <h1>Progress</h1>
        <div className="time-range-toggle">
          <button
            className={timeRange === '7days' ? 'active' : ''}
            onClick={() => setTimeRange('7days')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30days' ? 'active' : ''}
            onClick={() => setTimeRange('30days')}
          >
            30 Days
          </button>
        </div>
      </header>

      {/* Scores Chart */}
      <section className="chart-section">
        <h2>
          <Brain size={20} />
          Presence & Productivity Scores
        </h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis domain={[0, 10]} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="presence"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6' }}
                name="Presence"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                name="Productivity"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Deep Work Sets Chart */}
      <section className="chart-section">
        <h2>
          <Clock size={20} />
          Deep Work Sets
        </h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="sets" fill="#f59e0b" name="Sets (30 min)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5 Second Rule Usage */}
      <section className="chart-section">
        <h2>
          <Zap size={20} />
          5 Second Rule Usage
        </h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="social" fill="#3b82f6" name="Social" stackId="a" />
              <Bar dataKey="productivityActions" fill="#10b981" name="Productivity" stackId="a" />
              <Bar dataKey="presenceActions" fill="#8b5cf6" name="Presence" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Totals */}
        <div className="category-totals">
          {fiveSecondRuleData.map((item) => (
            <div key={item.name} className="category-total" style={{ borderColor: item.color }}>
              <span className="category-name">{item.name}</span>
              <span className="category-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Levels Games Progress */}
      <section className="levels-progress-section">
        <h2>
          <Trophy size={20} />
          Levels Games
        </h2>

        {/* Presence Level Details */}
        <div className="level-detail-card">
          <div className="level-detail-header">
            <Brain size={24} />
            <div>
              <h3>Presence Level {presenceLevelProgress?.currentLevel || 1}</h3>
              <p>
                {PRESENCE_LEVELS[(presenceLevelProgress?.currentLevel || 1) - 1]?.description}
              </p>
            </div>
          </div>

          <div className="level-requirements">
            <div className="requirement">
              <span className="req-label">Days at level:</span>
              <span className="req-value">
                {presenceLevelProgress?.daysAtCurrentLevel || 0} / {presenceLevelProgress?.requiredDays || 7}
              </span>
            </div>
            {presenceLevelProgress && presenceLevelProgress.requiredScore > 0 && (
              <div className="requirement">
                <span className="req-label">Average score:</span>
                <span className="req-value">
                  {presenceLevelProgress.averageScore.toFixed(1)} / {presenceLevelProgress.requiredScore}
                </span>
              </div>
            )}
          </div>

          <div className="level-progress-bar">
            <div
              className="progress-fill presence"
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

          {/* All Presence Levels */}
          <div className="all-levels">
            {PRESENCE_LEVELS.map((level) => (
              <div
                key={level.level}
                className={`level-item ${
                  (presenceLevelProgress?.currentLevel || 1) >= level.level ? 'achieved' : ''
                } ${(presenceLevelProgress?.currentLevel || 1) === level.level ? 'current' : ''}`}
              >
                <span className="level-num">{level.level}</span>
                <span className="level-desc">{level.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Level Details */}
        <div className="level-detail-card">
          <div className="level-detail-header">
            <Trophy size={24} />
            <div>
              <h3>Character 9 Level {productivityLevelProgress?.currentLevel || 1}</h3>
              <p>
                {PRODUCTIVITY_LEVELS[(productivityLevelProgress?.currentLevel || 1) - 1]?.description}
              </p>
            </div>
          </div>

          <div className="level-requirements">
            <div className="requirement">
              <span className="req-label">Days at level:</span>
              <span className="req-value">
                {productivityLevelProgress?.daysAtCurrentLevel || 0} / {productivityLevelProgress?.requiredDays || 3}
              </span>
            </div>
            <div className="requirement">
              <span className="req-label">Avg Productivity:</span>
              <span className="req-value">
                {productivityLevelProgress?.averageProductivityScore.toFixed(1) || 0} / {productivityLevelProgress?.requirements.minProductivityScore || 2}
              </span>
            </div>
            <div className="requirement">
              <span className="req-label">Avg Presence:</span>
              <span className="req-value">
                {productivityLevelProgress?.averagePresenceScore.toFixed(1) || 0} / {productivityLevelProgress?.requirements.minPresenceScore || 2}
              </span>
            </div>
            <div className="requirement">
              <span className="req-label">Avg Sets/Day:</span>
              <span className="req-value">
                {productivityLevelProgress?.averageSetsPerDay.toFixed(1) || 0} / {productivityLevelProgress?.requirements.minSetsPerDay || 12}
              </span>
            </div>
            {productivityLevelProgress?.requirements.dailyGoals && (
              <div className="requirement">
                <span className="req-label">Daily Goals:</span>
                <span className="req-value">{productivityLevelProgress.dailyGoalsAchievedRate}%</span>
              </div>
            )}
            {productivityLevelProgress?.requirements.weeklyGoals && (
              <div className="requirement">
                <span className="req-label">Weekly Goals:</span>
                <span className="req-value">{productivityLevelProgress.weeklyGoalsAchievedRate}%</span>
              </div>
            )}
            {productivityLevelProgress?.requirements.monthlyGoals && (
              <div className="requirement">
                <span className="req-label">Monthly Goals:</span>
                <span className="req-value">{productivityLevelProgress.monthlyGoalsAchievedRate}%</span>
              </div>
            )}
          </div>

          <div className="level-progress-bar">
            <div
              className="progress-fill productivity"
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

          {/* All Productivity Levels */}
          <div className="all-levels">
            {PRODUCTIVITY_LEVELS.map((level) => (
              <div
                key={level.level}
                className={`level-item ${
                  (productivityLevelProgress?.currentLevel || 1) >= level.level ? 'achieved' : ''
                } ${(productivityLevelProgress?.currentLevel || 1) === level.level ? 'current' : ''}`}
              >
                <span className="level-num">{level.level}</span>
                <span className="level-desc">{level.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgressScreen;
