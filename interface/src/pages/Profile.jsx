import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authApi, profileApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const GOAL_LABELS = {
  perte_poids: 'Perte de poids',
  musculation: 'Musculation',
  maintien: 'Maintien',
  performance: 'Performance',
};

const FIELD_OPTIONS = {
  goal: [
    { value: 'perte_poids', icon: 'ph-fire', title: 'Perte de poids', desc: 'Déficit calorique · Cardio · Fat loss' },
    { value: 'musculation', icon: 'ph-dumbbell', title: 'Musculation', desc: 'Surplus calorique · Force · Masse musculaire' },
    { value: 'maintien', icon: 'ph-heartbeat', title: 'Maintien', desc: 'Stabilité · Forme générale · Santé' },
    { value: 'performance', icon: 'ph-rocket-launch', title: 'Performance', desc: 'Endurance · Vitesse · Force explosive' },
  ],
  level: [
    { value: 'débutant', icon: 'ph-seedling', title: 'Débutant', desc: 'Nouveau dans le fitness · Apprentissage des bases' },
    { value: 'intermédiaire', icon: 'ph-trend-up', title: 'Intermédiaire', desc: 'Entraînement régulier · Technique maîtrisée' },
    { value: 'avancé', icon: 'ph-crown', title: 'Avancé', desc: 'Expertise · Haute intensité · Objectifs avancés' },
  ],
  equipment: [
    { value: 'salle', icon: 'ph-buildings', title: 'Salle', desc: 'Accès complet aux machines et poids libres' },
    { value: 'maison', icon: 'ph-house', title: 'Maison', desc: 'Entraînement à domicile avec équipement de base' },
    { value: 'aucun équipement', icon: 'ph-x-circle', title: 'Aucun équipement', desc: 'Exercices au poids du corps uniquement' },
    { value: 'équipement limité', icon: 'ph-toolbox', title: 'Équipement limité', desc: 'Quelques accessoires : élastiques, haltères légers' },
  ],
};

const CheckBadgeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--lime, #C8F135)" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.29 16.29L5.7 12.7C5.31 12.31 5.31 11.68 5.7 11.29C6.09 10.9 6.72 10.9 7.11 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.7 16.29C10.32 16.68 9.68 16.68 9.29 16.29Z" fill="currentColor"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><box x="2" y="7" width="20" height="14" rx="2" ry="2"></box><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);
const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);

export default function Profile({ theme, toggleTheme }) {
  const { userEmail } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState({ first_name: '', last_name: '' });
  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', gender: 'homme', weight_kg: '', height_cm: '',
    goal: 'perte_poids', level: 'débutant', equipment: 'salle', days_per_week: 4, language: 'fr'
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [activeTab, setActiveTab] = useState('Overview');
  const [autoRenew, setAutoRenew] = useState(true);

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

        const userNameFromUser = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ');

        if (profileData) {
          setFormData(prev => ({
            ...prev,
            name: profileData.name || userNameFromUser || prev.name,
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
          if (profileData.auto_renew !== undefined) setAutoRenew(profileData.auto_renew);
        } else {
          setFormData(prev => ({ ...prev, name: userNameFromUser || prev.name }));
        }
      } catch (err) {
        console.error('Unable to load profile', err);
        navigate('/auth');
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    // Esc key to close popup
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setEditingField(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10) || 0,
        weight_kg: parseFloat(formData.weight_kg) || 0,
        height_cm: parseFloat(formData.height_cm) || 0,
      };
      await profileApi.updateProfile(payload);
      setProfile(prev => ({ ...prev, ...payload }));
      setSaveMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour du profil.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleFieldEdit = async (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setEditingField(null);
    try {
      const payload = {
        ...updated,
        age: parseInt(updated.age, 10) || 0,
        weight_kg: parseFloat(updated.weight_kg) || 0,
        height_cm: parseFloat(updated.height_cm) || 0,
      };
      await profileApi.updateProfile(payload);
      setProfile(prev => ({ ...prev, ...payload }));
    } catch (err) {
      console.error('Failed to save field:', err);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('is_profile_complete');
      navigate('/auth');
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression du compte.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAutoRenewToggle = async () => {
    const next = !autoRenew;
    setAutoRenew(next);
    try {
      await profileApi.updateProfile({ auto_renew: next });
      setProfile(prev => ({ ...prev, auto_renew: next }));
    } catch (err) {
      setAutoRenew(!next);
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
    formData.name || profile?.name || userEmail?.split('@')[0] || 'Your Name';
  const initials = ((userData.first_name?.[0] || '') + (userData.last_name?.[0] || '')).toUpperCase() || '?';

  const membershipName = profile?.membership_name || 'Reignite Fitness Pack';
  const planType = profile?.plan_type || 'Wellness';
  const redeemItems = profile?.redeem_for || ['Victory Fitness', 'Wellness', 'PT session', 'Formal Fitness', 'Breakdown', 'GoodLife Fitness'];

  const programsCount = profile?.programs_count ?? 6;
  const hoursTrained = profile?.hours_trained ?? 200;
  const purchaseDate = profile?.purchase_date || '19 January, 2025';
  const totalCost = profile?.cost || '$10.00';
  const appointments = profile?.appointments ?? 10;
  const recurrence = profile?.recurrence || 'Monthly';
  const source = profile?.source || 'Online';

  const ToggleSwitch = ({ active, onToggle }) => (
    <div className={`dp-toggle ${active ? 'active' : ''}`} onClick={onToggle}>
      <div className="dp-toggle-knob" />
    </div>
  );

  const FieldSelector = ({ field, value, onSelect, onClose }) => {
    const options = FIELD_OPTIONS[field] || [];
    const titles = { goal: 'Choose your goal', level: 'Choose your level', equipment: 'Choose your equipment' };
    return (
      <div className="dp-selector-overlay" onClick={onClose}>
        <div className="dp-selector-popup" onClick={e => e.stopPropagation()}>
          <h3 className="dp-selector-title">{titles[field] || 'Select'}</h3>
          <div className="dp-selector-cards">
            {options.map(opt => (
              <button
                key={opt.value}
                className={`dp-selector-card ${value === opt.value ? 'selected' : ''}`}
                onClick={() => onSelect(opt.value)}
              >
                <div className="dp-selector-card-icon"><i className={`ph ${opt.icon}`}></i></div>
                <div className="dp-selector-card-text">
                  <span className="dp-selector-card-title">{opt.title}</span>
                  <span className="dp-selector-card-desc">{opt.desc}</span>
                </div>
                {value === opt.value && <span className="dp-selector-card-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dark-profile-page">
      <div className="dp-container">
        
        <div className="dp-header">
          <h1 className="dp-title">My profile</h1>
          <div className="dp-header-actions">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>

        <div className="dp-user-info">
          <div className={`dp-avatar-wrapper ${profile?.avatar_url ? 'has-image' : ''}`}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={fullName} className="dp-avatar" />
            ) : (
              <div className="dp-avatar">{initials}</div>
            )}
            <label className="dp-avatar-camera">
              <CameraIcon />
              <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
            </label>
          </div>
          
          <div className="dp-name-row">
            <h2>{fullName}</h2>
            <CheckBadgeIcon />
          </div>
          <p className="dp-stats">{programsCount} Active Programs · {hoursTrained} Hrs Trained</p>
        </div>

        <div className="dp-desktop-layout">
          <div className="dp-column-left">
            <div className="dp-tabs" style={{justifyContent: 'flex-start'}}>
              <button 
                className={`dp-tab ${activeTab === 'Overview' ? 'active' : ''}`} 
                onClick={() => setActiveTab('Overview')}
              >
                Overview
              </button>
              <button 
                className={`dp-tab ${activeTab === 'Subscriptions' ? 'active' : ''}`} 
                onClick={() => setActiveTab('Subscriptions')}
              >
                Subscriptions
              </button>
            </div>

            <div className="dp-list-section">
              {activeTab === 'Overview' ? (
                <>
                  <div className="dp-list-item" onClick={() => setEditingField('goal')} style={{ cursor: 'pointer' }}>
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><TargetIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Goal</span>
                        <span className="dp-list-item-sub">{GOAL_LABELS[formData.goal] || formData.goal}</span>
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>
                  {editingField === 'goal' && (
                    <FieldSelector field="goal" value={formData.goal} onSelect={(v) => handleFieldEdit('goal', v)} onClose={() => setEditingField(null)} />
                  )}

                  <div className="dp-list-item" onClick={() => setEditingField('level')} style={{ cursor: 'pointer' }}>
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><ActivityIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Level</span>
                        <span className="dp-list-item-sub">{formData.level}</span>
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>
                  {editingField === 'level' && (
                    <FieldSelector field="level" value={formData.level} onSelect={(v) => handleFieldEdit('level', v)} onClose={() => setEditingField(null)} />
                  )}

                  <div className="dp-list-item" onClick={() => setEditingField('equipment')} style={{ cursor: 'pointer' }}>
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><PackageIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Equipment</span>
                        <span className="dp-list-item-sub">{formData.equipment}</span>
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>
                  {editingField === 'equipment' && (
                    <FieldSelector field="equipment" value={formData.equipment} onSelect={(v) => handleFieldEdit('equipment', v)} onClose={() => setEditingField(null)} />
                  )}
                </>
              ) : (
                <>
                  <div className="dp-list-item">
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><PackageIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Abonnement</span>
                        <span className="dp-list-item-sub">{membershipName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dp-list-item">
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><ActivityIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Type</span>
                        <span className="dp-list-item-sub">{planType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dp-list-item">
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><CalendarIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Récurrence</span>
                        <span className="dp-list-item-sub">{recurrence}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dp-list-item">
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><GlobeIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Source</span>
                        <span className="dp-list-item-sub">{source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dp-list-item">
                    <div className="dp-list-item-left">
                      <div className="dp-list-item-icon"><ActivityIcon /></div>
                      <div className="dp-list-item-text">
                        <span className="dp-list-item-title">Auto-renew subscription</span>
                      </div>
                    </div>
                    <div className="dp-list-item-right" onClick={(e) => e.stopPropagation()}>
                      <ToggleSwitch active={autoRenew} onToggle={handleAutoRenewToggle} />
                    </div>
                  </div>

                  <div className="dp-section-title" style={{marginTop: 16}}>Redeem For</div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
                    {redeemItems.map((item, index) => (
                      <span key={index} style={{
                        backgroundColor: 'rgba(200, 241, 53, 0.12)',
                        color: '#000',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="dp-column-right">
            <div className="dp-form">
              <h3 className="dp-section-title" style={{margin: 0}}>Personal Details</h3>
              
              <div className="dp-input-group">
                <label className="dp-input-label">Full name</label>
                <input className="dp-input" type="text" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Your Name" />
              </div>
              
              <div className="dp-input-group">
                <label className="dp-input-label">Phone number</label>
                <input className="dp-input" type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="0000-0000-0000" />
              </div>
              
              <div className="dp-form-row">
                <div className="dp-input-group">
                  <label className="dp-input-label">Age</label>
                  <input className="dp-input" type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} placeholder="25" />
                </div>
                
                <div className="dp-input-group">
                  <label className="dp-input-label">Gender</label>
                  <select className="dp-select" value={formData.gender} onChange={e => updateField('gender', e.target.value)}>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </div>
              </div>

              <div className="dp-form-row">
                <div className="dp-input-group">
                  <label className="dp-input-label">Weight (kg)</label>
                  <input className="dp-input" type="number" value={formData.weight_kg} onChange={e => updateField('weight_kg', e.target.value)} placeholder="70" />
                </div>
                
                <div className="dp-input-group">
                  <label className="dp-input-label">Height (cm)</label>
                  <input className="dp-input" type="number" value={formData.height_cm} onChange={e => updateField('height_cm', e.target.value)} placeholder="175" />
                </div>
              </div>

              {saveMessage && (
                <div className={`dp-save-message ${saveMessage.type}`}>{saveMessage.text}</div>
              )}

              <button className="dp-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button className="dp-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>

      {showDeleteConfirm && (
        <div className="dp-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="dp-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.</p>
            <div className="dp-modal-actions">
              <button className="dp-modal-btn dp-modal-btn-cancel" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancel</button>
              <button className="dp-modal-btn dp-modal-btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
