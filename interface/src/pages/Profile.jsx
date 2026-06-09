import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { authApi, profileApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const GOAL_LABELS = {
  perte_poids: 'Perte de poids',
  musculation: 'Musculation',
  maintien: 'Maintien',
};

export default function Profile({ theme, toggleTheme }) {
  const { userEmail } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState({ first_name: '', last_name: '' });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
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
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileData, userInfo] = await Promise.all([
          profileApi.getProfile(),
          authApi.getMe().catch(() => ({ first_name: '', last_name: '' })),
        ]);
        setProfile(profileData);
        setUserData(userInfo);

        if (profileData) {
          setFormData(prev => ({
            ...prev,
            name: profileData.name ?? prev.name,
            phone: profileData.phone ?? prev.phone,
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
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10) || 0,
        weight_kg: parseFloat(formData.weight_kg) || 0,
        height_cm: parseFloat(formData.height_cm) || 0,
      };
      await profileApi.updateProfile(payload);
      setProfile(prev => ({ ...prev, ...payload }));
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await profileApi.uploadAvatar(file);
      setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
    } catch (err) {
      alert(err.message || 'Erreur lors du téléchargement de l\'avatar.');
    } finally {
      setUploading(false);
    }
  };

  const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ') ||
    formData.name || profile?.name || userEmail?.split('@')[0] || 'James D';
  const initials = ((userData.first_name?.[0] || '') + (userData.last_name?.[0] || '')).toUpperCase() || '?';

  const phone = formData.phone || profile?.phone || '+212 600 000 000';
  const membershipName = profile?.membership_name || 'Reignite Fitness Pack';
  const planType = profile?.plan_type || 'Wellness';
  const redeemItems = profile?.redeem_for || ['Victory Fitness', 'Wellness', 'PT session', 'Formal Fitness', 'Breakdown', 'GoodLife Fitness'];

  return (
    <main className="dash-main">
      <div className="profile-page-content">
        <div className="profile-toolbar">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="profile-header-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {profile?.avatar_url ? (
                <img className="profile-avatar-large" src={profile.avatar_url} alt={fullName} />
              ) : (
                <div className="profile-avatar-large">{initials}</div>
              )}
              <label className={`profile-avatar-overlay ${uploading ? 'uploading' : ''}`}>
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                {uploading ? '...' : '+'}
              </label>
            </div>

            <div className="profile-header-info">
              <span className="profile-subtitle">Premium Member</span>
              <h1>{fullName}</h1>
              <div className="profile-contact-row">
                <span>{userEmail || 'james@gmail.com'}</span>
                <span>{phone}</span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
            {editing ? (
              <>
                <button type="button" className="btn-ghost" onClick={() => { setEditing(false); }}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
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

          {!editing ? (
            <div className="profile-detail-list">
              <div className="profile-detail-item">
                <label>Full Name</label>
                <span>{fullName || '-'}</span>
              </div>
              <div className="profile-detail-item">
                <label>Phone</label>
                <span>{formData.phone || '-'}</span>
              </div>
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
                <span>{GOAL_LABELS[formData.goal] || formData.goal}</span>
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
          ) : (
            <div className="profile-detail-list profile-form-fields">
              <div className="profile-field-row">
                <label>Full Name</label>
                <input type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Your name" />
              </div>
              <div className="profile-field-row">
                <label>Phone</label>
                <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+212 600 000 000" />
              </div>
              <div className="profile-field-row">
                <label>Âge</label>
                <input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} min="10" max="120" />
              </div>
              <div className="profile-field-row">
                <label>Genre</label>
                <select value={formData.gender} onChange={e => updateField('gender', e.target.value)}>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
              <div className="profile-field-row">
                <label>Poids (kg)</label>
                <input type="number" value={formData.weight_kg} onChange={e => updateField('weight_kg', e.target.value)} min="20" max="300" step="0.1" />
              </div>
              <div className="profile-field-row">
                <label>Taille (cm)</label>
                <input type="number" value={formData.height_cm} onChange={e => updateField('height_cm', e.target.value)} min="50" max="250" />
              </div>
              <div className="profile-field-row">
                <label>Objectif</label>
                <select value={formData.goal} onChange={e => updateField('goal', e.target.value)}>
                  <option value="perte_poids">Perte de poids</option>
                  <option value="musculation">Musculation</option>
                  <option value="maintien">Maintien</option>
                </select>
              </div>
              <div className="profile-field-row">
                <label>Niveau</label>
                <select value={formData.level} onChange={e => updateField('level', e.target.value)}>
                  <option value="débutant">Débutant</option>
                  <option value="intermédiaire">Intermédiaire</option>
                  <option value="avancé">Avancé</option>
                </select>
              </div>
              <div className="profile-field-row">
                <label>Équipement</label>
                <select value={formData.equipment} onChange={e => updateField('equipment', e.target.value)}>
                  <option value="salle">Salle de sport</option>
                  <option value="domicile">À domicile</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              <div className="profile-field-row">
                <label>Jours / semaine</label>
                <select value={formData.days_per_week} onChange={e => updateField('days_per_week', parseInt(e.target.value))}>
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} jour{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="profile-field-row">
                <label>Langue</label>
                <select value={formData.language} onChange={e => updateField('language', e.target.value)}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}