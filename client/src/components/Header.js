import React from 'react';
import './Header.css';
import ThemeToggle from './ThemeToggle';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>💪 MySport</h1>
          <p>Votre planner de musculation complet</p>
        </div>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
