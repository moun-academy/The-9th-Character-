import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import HabitsScreen from './screens/HabitsScreen';
import GoalsScreen from './screens/GoalsScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import Navigation from './components/Navigation';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginScreen />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DataProvider>
              <div className="app-container">
                <main className="main-content">
                  <HomeScreen />
                </main>
                <Navigation />
              </div>
            </DataProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/habits"
        element={
          <ProtectedRoute>
            <DataProvider>
              <div className="app-container">
                <main className="main-content">
                  <HabitsScreen />
                </main>
                <Navigation />
              </div>
            </DataProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <DataProvider>
              <div className="app-container">
                <main className="main-content">
                  <GoalsScreen />
                </main>
                <Navigation />
              </div>
            </DataProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <DataProvider>
              <div className="app-container">
                <main className="main-content">
                  <ProgressScreen />
                </main>
                <Navigation />
              </div>
            </DataProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DataProvider>
              <div className="app-container">
                <main className="main-content">
                  <SettingsScreen />
                </main>
                <Navigation />
              </div>
            </DataProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
