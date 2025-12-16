import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setLocalError('Username et mot de passe sont requis');
      return;
    }

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Erreur lors de la connexion');
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💪 MySport</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        {(error || localError) && (
          <div className="auth-error">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Votre nom d'utilisateur"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Votre mot de passe"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte?{' '}
          <Link to="/register" className="auth-link">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
