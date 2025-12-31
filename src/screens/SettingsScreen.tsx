import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
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
  sendTestNotification,
  startHourlyNotifications,
  stopHourlyNotifications,
  getNextHourlyNotificationTime,
  calculateNotificationsPerDay,
} from '../services/notificationService';

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { loading, settings, updateSettings } = useData();
  const { fcmToken, requestPermission, isSupported } = useNotification();

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [identityDraft, setIdentityDraft] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(getNotificationPermission());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [nextNotificationTime, setNextNotificationTime] = useState<string | null>(null);

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
    await requestPermission();
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

  const handleTestNotification = async () => {
    console.log('🧪 User clicked Test Notification button');
    const result = await sendTestNotification();
    setTestResult(result);

    // Clear the result after 5 seconds
    setTimeout(() => {
      setTestResult(null);
    }, 5000);
  };

  const handleHourlyToggle = async (enabled: boolean) => {
    await updateSettings({ hourlyNotificationsEnabled: enabled });

    if (enabled) {
      const config = {
        startTime: settings.hourlyNotificationStartTime || '07:00',
        endTime: settings.hourlyNotificationEndTime || '21:00',
        message: settings.hourlyNotificationMessage || 'Are you doing what\'s right? If not, use the 5 second rule!',
      };
      await startHourlyNotifications(config);
      updateNextNotificationTime(config);
    } else {
      stopHourlyNotifications();
      setNextNotificationTime(null);
    }
  };

  const handleHourlyTimeChange = async (field: 'hourlyNotificationStartTime' | 'hourlyNotificationEndTime', value: string) => {
    await updateSettings({ [field]: value });

    if (settings.hourlyNotificationsEnabled) {
      const config = {
        startTime: field === 'hourlyNotificationStartTime' ? value : (settings.hourlyNotificationStartTime || '07:00'),
        endTime: field === 'hourlyNotificationEndTime' ? value : (settings.hourlyNotificationEndTime || '21:00'),
        message: settings.hourlyNotificationMessage || 'Are you doing what\'s right? If not, use the 5 second rule!',
      };
      stopHourlyNotifications();
      await startHourlyNotifications(config);
      updateNextNotificationTime(config);
    }
  };

  const handleHourlyMessageChange = async (message: string) => {
    await updateSettings({ hourlyNotificationMessage: message });

    if (settings.hourlyNotificationsEnabled) {
      const config = {
        startTime: settings.hourlyNotificationStartTime || '07:00',
        endTime: settings.hourlyNotificationEndTime || '21:00',
        message: message,
      };
      stopHourlyNotifications();
      await startHourlyNotifications(config);
    }
  };

  const updateNextNotificationTime = (config: { startTime: string; endTime: string }) => {
    const nextTime = getNextHourlyNotificationTime(config);
    setNextNotificationTime(nextTime);
  };

  // Initialize hourly notifications on mount if enabled
  React.useEffect(() => {
    if (settings && settings.hourlyNotificationsEnabled && notificationStatus === 'granted') {
      const config = {
        startTime: settings.hourlyNotificationStartTime || '07:00',
        endTime: settings.hourlyNotificationEndTime || '21:00',
        message: settings.hourlyNotificationMessage || 'Are you doing what\'s right? If not, use the 5 second rule!',
      };
      startHourlyNotifications(config);
      updateNextNotificationTime(config);

      // Update next notification time every minute
      const interval = setInterval(() => {
        updateNextNotificationTime(config);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [settings, notificationStatus]);

  const notificationsSupported = isSupported;

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

              {/* Notification Tester Section */}
              <div className="notification-tester">
                <h3 style={{ marginTop: '20px', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                  🧪 NOTIFICATION TESTER
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {/* Permission Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Permission:</span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: notificationStatus === 'granted' ? 'var(--accent-success)' :
                             notificationStatus === 'denied' ? 'var(--accent-danger)' :
                             'var(--accent-warning)'
                    }}>
                      {notificationStatus === 'granted' ? '✅ Granted' :
                       notificationStatus === 'denied' ? '❌ Denied' :
                       '⚠️ Not requested'}
                    </span>
                  </div>

                  {/* FCM Token Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>FCM Token:</span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: fcmToken ? 'var(--accent-success)' : 'var(--accent-danger)'
                    }}>
                      {fcmToken ? '✅ Generated' : '❌ Not generated'}
                    </span>
                  </div>
                </div>

                {/* Test Notification Button */}
                {notificationStatus === 'granted' && (
                  <button
                    className="btn-primary"
                    onClick={handleTestNotification}
                    style={{
                      width: '100%',
                      marginBottom: '12px',
                      background: 'var(--accent-5sr-gradient)',
                      fontSize: '15px',
                      fontWeight: '600'
                    }}
                  >
                    🔔 Send Test Notification Now
                  </button>
                )}

                {/* Request Permission Button */}
                {notificationStatus !== 'granted' && (
                  <button
                    className="btn-primary"
                    onClick={handleRequestNotifications}
                    style={{ width: '100%', marginBottom: '12px' }}
                  >
                    <Bell size={20} />
                    Request Permission
                  </button>
                )}

                {/* Test Result Message */}
                {testResult && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${testResult.success ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}>
                    {testResult.success ? '✅' : '❌'} {testResult.message}
                  </div>
                )}

                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '12px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px'
                }}>
                  💡 Check browser console for detailed logs
                </div>
              </div>

              <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

              {/* Hourly Notification Scheduler */}
              <div className="hourly-scheduler">
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  ⏰ HOURLY NOTIFICATION SCHEDULER
                </h3>

                {/* Enable/Disable Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Enable Hourly Notifications</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={settings.hourlyNotificationsEnabled || false}
                      onChange={(e) => handleHourlyToggle(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings.hourlyNotificationsEnabled ? 'var(--accent-success)' : '#ccc',
                      transition: '0.4s',
                      borderRadius: '24px',
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: settings.hourlyNotificationsEnabled ? '28px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%',
                      }} />
                    </span>
                  </label>
                </div>

                {/* Time Range Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={settings.hourlyNotificationStartTime || '07:00'}
                        onChange={(e) => handleHourlyTimeChange('hourlyNotificationStartTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        End Time
                      </label>
                      <input
                        type="time"
                        value={settings.hourlyNotificationEndTime || '21:00'}
                        onChange={(e) => handleHourlyTimeChange('hourlyNotificationEndTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid var(--accent-presence)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text-primary)'
                  }}>
                    📊 {calculateNotificationsPerDay(
                      settings.hourlyNotificationStartTime || '07:00',
                      settings.hourlyNotificationEndTime || '21:00'
                    )} notifications from {settings.hourlyNotificationStartTime || '07:00'} to {settings.hourlyNotificationEndTime || '21:00'}
                  </div>
                </div>

                {/* Notification Message */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Notification Message
                  </label>
                  <textarea
                    value={settings.hourlyNotificationMessage || 'Are you doing what\'s right? If not, use the 5 second rule!'}
                    onChange={(e) => handleHourlyMessageChange(e.target.value)}
                    placeholder="Enter your custom message..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Next Notification Time */}
                {settings.hourlyNotificationsEnabled && nextNotificationTime && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--accent-5sr)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontWeight: '500'
                  }}>
                    🔔 Next notification at: {nextNotificationTime}
                  </div>
                )}

                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '12px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px'
                }}>
                  ℹ️ Notifications will trigger every hour within the configured time range. Keep the app open in background for best results.
                </div>
              </div>

              <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

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
          <p className="version">v12-31-1542</p>
          {fcmToken && (
            <p className="fcm-status">Push notifications enabled</p>
          )}
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
