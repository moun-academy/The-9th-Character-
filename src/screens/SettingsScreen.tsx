import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  User,
  Bell,
  LogOut,
  Edit2,
  Check,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  requestNotificationPermission,
  getNotificationPermission,
  checkNotificationSupport,
} from '../services/notificationService';

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { loading, settings, updateSettings } = useData();

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [identityDraft, setIdentityDraft] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(getNotificationPermission());

  if (loading || !settings) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  const handleIdentitySave = async () => {
    if (identityDraft.trim()) {
      await updateSettings({ identity: identityDraft.trim() });
    }
    setEditingIdentity(false);
  };

  const handleRequestNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      await updateSettings({ notificationsEnabled: true });
    }
  };

  const handleTimeChange = async (
    field: 'morningReminderTime' | 'middayReminderTime' | 'eveningReminderTime',
    value: string
  ) => {
    await updateSettings({ [field]: value });
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const notificationsSupported = checkNotificationSupport();

  return (
    <div className="settings-screen">
      <header className="screen-header">
        <h1>Settings</h1>
      </header>

      {/* Profile Section */}
      <section className="settings-section">
        <h2>
          <User size={20} />
          Profile
        </h2>
        <div className="settings-card">
          <div className="profile-info">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar placeholder">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-details">
              <span className="profile-name">{user?.displayName || 'User'}</span>
              <span className="profile-email">{user?.email}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Section */}
      <section className="settings-section">
        <h2>
          <Edit2 size={20} />
          Identity (North Star)
        </h2>
        <div className="settings-card">
          {editingIdentity ? (
            <div className="identity-edit">
              <textarea
                value={identityDraft}
                onChange={(e) => setIdentityDraft(e.target.value)}
                placeholder="Who are you becoming?"
                rows={3}
              />
              <div className="identity-edit-actions">
                <button className="btn-icon save" onClick={handleIdentitySave}>
                  <Check size={20} />
                </button>
                <button
                  className="btn-icon cancel"
                  onClick={() => setEditingIdentity(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="identity-display">
              <p>{settings.identity}</p>
              <button
                className="btn-icon edit"
                onClick={() => {
                  setIdentityDraft(settings.identity);
                  setEditingIdentity(true);
                }}
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}
          <p className="settings-hint">
            This is who you are becoming. Every day, you cast a vote for this identity.
          </p>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="settings-section">
        <h2>
          <Bell size={20} />
          Notifications
        </h2>
        <div className="settings-card">
          {!notificationsSupported ? (
            <div className="notification-warning">
              <AlertCircle size={20} />
              <p>Notifications are not supported in this browser.</p>
            </div>
          ) : notificationStatus === 'denied' ? (
            <div className="notification-warning">
              <AlertCircle size={20} />
              <p>Notifications are blocked. Please enable them in your browser settings.</p>
            </div>
          ) : notificationStatus === 'granted' ? (
            <>
              <div className="notification-status success">
                <Check size={20} />
                <span>Notifications enabled</span>
              </div>

              <div className="reminder-times">
                <h3>
                  <Clock size={16} />
                  Reminder Times
                </h3>

                <div className="time-setting">
                  <label>Morning (Identity vote & Goals)</label>
                  <input
                    type="time"
                    value={settings.morningReminderTime}
                    onChange={(e) => handleTimeChange('morningReminderTime', e.target.value)}
                  />
                </div>

                <div className="time-setting">
                  <label>Midday (5 Second Rule)</label>
                  <input
                    type="time"
                    value={settings.middayReminderTime}
                    onChange={(e) => handleTimeChange('middayReminderTime', e.target.value)}
                  />
                </div>

                <div className="time-setting">
                  <label>Evening (Scores & Sets)</label>
                  <input
                    type="time"
                    value={settings.eveningReminderTime}
                    onChange={(e) => handleTimeChange('eveningReminderTime', e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="notification-request">
              <p>Enable notifications to receive reminders throughout the day.</p>
              <button className="btn-primary" onClick={handleRequestNotifications}>
                <Bell size={20} />
                Enable Notifications
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="settings-section">
        <h2>About</h2>
        <div className="settings-card about">
          <h3>The 9th Character</h3>
          <p>Your daily cockpit for presence and action.</p>
          <p className="philosophy-quote">
            "5, 4, 3, 2, 1... GO"
          </p>
          <p className="version">Version 27 Dec - 11:08</p>
        </div>
      </section>

      {/* Sign Out */}
      <section className="settings-section">
        <button className="btn-signout" onClick={handleSignOut}>
          <LogOut size={20} />
          Sign Out
        </button>
      </section>
    </div>
  );
};

export default SettingsScreen;
