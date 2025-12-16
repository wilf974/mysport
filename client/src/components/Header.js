import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>💪 MySport</h1>
          <p>Votre planner de musculation complet</p>
        </div>
        <div className="header-actions">
          {user && (
            <div className="user-info">
              <span className="username">👤 {user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
