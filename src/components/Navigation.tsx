import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Target, BarChart3, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <>
      <nav className="navigation">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/habits" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CheckSquare size={24} />
          <span>Habits</span>
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Target size={24} />
          <span>Goals</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={24} />
          <span>Progress</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
      </nav>
      <div className="app-footer">v30-12-2055</div>
    </>
  );
};

export default Navigation;
