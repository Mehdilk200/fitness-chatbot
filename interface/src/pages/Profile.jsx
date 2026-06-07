import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileApi, authApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import logoImg from '../assets/logoelet.png';

export default function Profile({ theme, toggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    gender: 'homme',
    weight_kg: '',
    height_cm: '',
    goal: 'perte_poids',
    level: 'débutant',
    equipment: 'salle',
    days_per_week: 4,
    language: 'fr'
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [authData, profileData] = await Promise.all([
          authApi.getMe(),
          profileApi.getProfile()
        ]);

        setUserEmail(authData.email);
        setProfile(profileData);

        if (profileData) {
          setFormData(prev => ({
            ...prev,
            age: profileData.age ?? prev.age,
            gender: profileData.gender ?? prev.gender,
            weight_kg: profileData.weight_kg ?? prev.weight_kg,
            height_cm: profileData.height_cm ?? prev.height_cm,
            goal: profileData.goal ?? prev.goal,
            level: profileData.level ?? prev.level,
            equipment: profileData.equipment ?? prev.equipment,
            days_per_week: profileData.days_per_week ?? prev.days_per_week,
            language: profileData.language ?? prev.language,
          }));
        }
      } catch (err) {
        console.error('Unable to load profile', err);
        navigate('/auth');
      }
    };

    fetchProfile();
  }, [navigate]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.updateProfile({
        ...formData,
        age: parseInt(formData.age, 10),
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
      });
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || userEmail?.split('@')[0] || 'James D';
  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const phone = profile?.phone || '+212 600 000 000';
  const membershipName = profile?.membership_name || 'Reignite Fitness Pack';
  const planType = profile?.plan_type || 'Wellness';
  const redeemItems = profile?.redeem_for || ['Victory Fitness', 'Wellness', 'PT session', 'Formal Fitness', 'Breakdown', 'GoodLife Fitness'];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo logo-img-wrap">
            <img src={logoImg} alt="ELITEFIT" className="logo-img" />
            <span className="logo-text">ELITEFI<span>T</span></span>
          </Link>
          <button className="sidebar-close" onClick={toggleSidebar} aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
            <i className={`ph ${sidebarOpen ? 'ph-caret-left' : 'ph-list'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/chat" className="nav-item"><span className="ni"><i className="ph ph-chat-circle-text"></i></span><span className="nav-text">Chat</span></Link>
          <Link to="/dashboard" className="nav-item"><span className="ni"><i className="ph ph-chart-bar"></i></span><span className="nav-text">Dashboard</span></Link>
          <Link to="/profile" className="nav-item active"><span className="ni"><i className="ph ph-user"></i></span><span className="nav-text">Profil</span></Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <span>{userEmail || 'james@gmail.com'}</span>
              <span className="user-plan">Member</span>
            </div>
          </div>
          <button className="btn-logout" onClick={() => { localStorage.clear(); navigate('/auth'); }}>
            <i className="ph ph-sign-out"></i>
            <span className="logout-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="profile-page-content">
          <div className="profile-toolbar">
            <button className="topbar-btn" onClick={toggleSidebar}><i className="ph ph-list"></i></button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>

          <div className="profile-header-card">
            <div className="profile-avatar-section">
              {profile?.avatar_url ? (
                <img className="profile-avatar-large" src={profile.avatar_url} alt={displayName} />
              ) : (
                <div className="profile-avatar-large">{initials}</div>
              )}

              <div className="profile-header-info">
                <span className="profile-subtitle">Premium Member</span>
                <h1>{displayName}</h1>
                <div className="profile-contact-row">
                  <span>{userEmail || 'james@gmail.com'}</span>
                  <span>{phone}</span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button type="button" className="btn-secondary">Session Sign Off</button>
              <button type="button" className="btn-primary">Enroll</button>
            </div>
          </div>

          <div className="profile-summary-grid">
            <div className="profile-card">
              <div className="card-top">
                <div>
                  <p className="profile-card-label">Package Overview</p>
                  <h2>{membershipName}</h2>
                </div>
                <span className="status-pill">Active</span>
              </div>

              <div className="profile-stat-grid">
                <div className="profile-stat">
                  <label>Acheté le</label>
                  <span>19 January, 2025</span>
                </div>
                <div className="profile-stat">
                  <label>Coût total</label>
                  <span>$10.00</span>
                </div>
                <div className="profile-stat">
                  <label>Rendez-vous</label>
                  <span>10</span>
                </div>
                <div className="profile-stat">
                  <label>Plan</label>
                  <span>{planType}</span>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <div className="card-top">
                <p className="profile-card-label">Subscriptions Info</p>
                <span className="pill-text">Redeem</span>
              </div>
              <div className="profile-detail-list profile-summary-list">
                <div className="profile-detail-item">
                  <label>Abonnement</label>
                  <span>{membershipName}</span>
                </div>
                <div className="profile-detail-item">
                  <label>Type</label>
                  <span>{planType}</span>
                </div>
                <div className="profile-detail-item">
                  <label>Récurrence</label>
                  <span>Monthly</span>
                </div>
                <div className="profile-detail-item">
                  <label>Source</label>
                  <span>Online</span>
                </div>
              </div>

              <div className="profile-chips">
                {redeemItems.map((item, index) => (
                  <span key={index} className="profile-chip">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-card profile-details-card">
            <div className="card-top">
              <p className="profile-card-label">Personal details</p>
              <Link to="/dashboard" className="btn-ghost">Back to Dashboard</Link>
            </div>
            <div className="profile-detail-list">
              <div className="profile-detail-item">
                <label>Âge</label>
                <span>{formData.age || profile?.age || '25'} ans</span>
              </div>
              <div className="profile-detail-item">
                <label>Genre</label>
                <span>{formData.gender === 'homme' ? 'Homme' : 'Femme'}</span>
              </div>
              <div className="profile-detail-item">
                <label>Poids</label>
                <span>{formData.weight_kg || profile?.weight_kg || '70'} kg</span>
              </div>
              <div className="profile-detail-item">
                <label>Taille</label>
                <span>{formData.height_cm || profile?.height_cm || '175'} cm</span>
              </div>
              <div className="profile-detail-item">
                <label>Objectif</label>
                <span>{formData.goal === 'perte_poids' ? 'Perte de poids' : formData.goal === 'musculation' ? 'Musculation' : 'Maintien'}</span>
              </div>
              <div className="profile-detail-item">
                <label>Niveau</label>
                <span>{formData.level}</span>
              </div>
              <div className="profile-detail-item">
                <label>Équipement</label>
                <span>{formData.equipment}</span>
              </div>
              <div className="profile-detail-item">
                <label>Jours / semaine</label>
                <span>{formData.days_per_week} jours</span>
              </div>
              <div className="profile-detail-item">
                <label>Langue</label>
                <span>{formData.language}</span>
              </div>
            </div>

            <div className="onboard-nav" style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Mettre à jour le profil'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
