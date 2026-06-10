import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';

export default function Auth() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
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
      navigate(data.is_profile_complete ? '/dashboard' : '/onboarding');
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
    const first_name = e.target['reg-first'].value.trim();
    const last_name = e.target['reg-last'].value.trim();
    const email = e.target['reg-email'].value;
    const password = e.target['reg-pass'].value;
    const confirm = e.target['reg-pass2'].value;

    if (password !== confirm) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.register(email, password, first_name, last_name);
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

  const handleOAuth = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/oauth/${provider}`;
  };

  return (
    <div className="auth-page">
      <div className="branding-side">
        <Link to="/" className="auth-logo">{t('common:appNameShort')}<span>{t('common:appNameSpan')}</span></Link>
        <div className="auth-bg-text">FIT</div>
        <div className="auth-quote">
          <div className="auth-badge">{t('authBadge')}</div>
          <h2>{t('authTitle')}</h2>
          <p>{t('authDesc')}</p>
          <div className="auth-stats">
            <div className="a-stat"><span>700+</span>{t('statExercises')}</div>
            <div className="a-stat"><span>100%</span>{t('statFree')}</div>
            <div className="a-stat"><span>AI</span>{t('statAi')}</div>
          </div>
        </div>
      </div>

      <div className="form-side">
        <div className="auth-toggle-group">
          <button
            className={`auth-toggle ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >{t('signIn')}</button>
          <button
            className={`auth-toggle ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >{t('signUp')}</button>
        </div>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="field">
              <label>{t('emailLabel')}</label>
              <input type="email" name="login-email" placeholder={t('emailPlaceholder')} required />
            </div>
            <div className="field">
              <label>{t('passwordLabel')}</label>
              <input type="password" name="login-pass" placeholder={t('passwordPlaceholder')} required />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="field-row">
              <div className="field">
                <label>{t('firstNameLabel')}</label>
                <input type="text" name="reg-first" placeholder={t('firstNamePlaceholder')} />
              </div>
              <div className="field">
                <label>{t('lastNameLabel')}</label>
                <input type="text" name="reg-last" placeholder={t('lastNamePlaceholder')} />
              </div>
            </div>
            <div className="field">
              <label>{t('emailLabel')}</label>
              <input type="email" name="reg-email" placeholder={t('emailPlaceholder')} required />
            </div>
            <div className="field">
              <label>{t('passwordLabel')}</label>
              <input type="password" name="reg-pass" placeholder={t('passwordPlaceholder')} minLength="6" required />
            </div>
            <div className="field">
              <label>{t('confirmPasswordLabel')}</label>
              <input type="password" name="reg-pass2" placeholder={t('confirmPasswordPlaceholder')} required />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('creatingAccount') : t('signUp')}
            </button>
          </form>
        )}

        <div className="auth-divider"><span>{t('orContinueWith')}</span></div>

        <div className="oauth-group">
          <button className="oauth-btn google" onClick={() => handleOAuth('google')}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>{t('google')}</span>
          </button>
          <button className="oauth-btn apple" onClick={() => handleOAuth('apple')}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            <span>{t('apple')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
