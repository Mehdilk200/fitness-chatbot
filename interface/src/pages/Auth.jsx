import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

export default function Auth({ theme, toggleTheme }) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = e.target['login-email'].value;
    const password = e.target['login-pass'].value;

    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('is_profile_complete', data.is_profile_complete);
      
      if (data.is_profile_complete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = e.target['reg-email'].value;
    const password = e.target['reg-pass'].value;
    const confirm = e.target['reg-pass2'].value;

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.register(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('is_profile_complete', 'false');
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 100 }}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <Link to="/" className="logo-top">ELITEFI<span>T</span></Link>

      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-bg-text">FIT</div>
          <div className="auth-quote">
            <div className="quote-tag">Coach IA · 4 Langues</div>
            <h2>Transform your<br/><span className="accent">body & mind</span></h2>
            <p>Programmes sur mesure, nutrition calculée, exercices avec GIFs.</p>
            <div className="auth-stats">
              <div className="a-stat"><span>700+</span>Exercices</div>
              <div className="a-stat"><span>100%</span>Gratuit</div>
              <div className="a-stat"><span>AI</span>Powered</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('login'); setError(''); }}
            >
              Se connecter
            </button>
            <button 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('register'); setError(''); }}
            >
              Créer un compte
            </button>
          </div>

          {activeTab === 'login' && (
            <form id="form-login" className="auth-form" onSubmit={handleLogin}>
              <h3 className="form-title">Bon retour <i className="ph ph-hand-waving"></i></h3>
              <div className="field">
                <label>Email</label>
                <input type="email" name="login-email" id="login-email" placeholder="coach@fitbot.com" required/>
              </div>
              <div className="field">
                <label>Mot de passe</label>
                <input type="password" name="login-pass" id="login-pass" placeholder="••••••••" required/>
              </div>
              {error && <div className="form-error" style={{display: 'block'}}>{error}</div>}
              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
              </button>
              <p className="form-foot">Pas de compte ? <a onClick={() => setActiveTab('register')} style={{cursor: 'pointer'}}>Créer un compte <i className="ph ph-arrow-right"></i></a></p>
            </form>
          )}

          {activeTab === 'register' && (
            <form id="form-register" className="auth-form" onSubmit={handleRegister}>
              <h3 className="form-title">Crée ton compte <i className="ph ph-rocket-launch"></i></h3>
              <div className="field">
                <label>Email</label>
                <input type="email" name="reg-email" id="reg-email" placeholder="toi@email.com" required/>
              </div>
              <div className="field">
                <label>Mot de passe</label>
                <input type="password" name="reg-pass" id="reg-pass" placeholder="Minimum 6 caractères" minLength="6" required/>
              </div>
              <div className="field">
                <label>Confirmer mot de passe</label>
                <input type="password" name="reg-pass2" id="reg-pass2" placeholder="••••••••" required/>
              </div>
              {error && <div className="form-error" style={{display: 'block'}}>{error}</div>}
              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                <span>{loading ? 'Création...' : 'Créer mon compte'}</span>
              </button>
              <p className="form-foot">Déjà un compte ? <a onClick={() => setActiveTab('login')} style={{cursor: 'pointer'}}>Se connecter <i className="ph ph-arrow-right"></i></a></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
