import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

export default function Onboarding({ theme, toggleTheme }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await profileApi.updateProfile({
          ...formData,
          age: parseInt(formData.age),
          weight_kg: parseFloat(formData.weight_kg),
          height_cm: parseFloat(formData.height_cm)
        });
        localStorage.setItem('is_profile_complete', 'true');
        navigate('/dashboard');
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="onboard-page">
      <div style={{ position: 'fixed', top: '24px', right: '32px' }}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="onboard-card">
        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          <span className="progress-label">Étape {step}/4</span>
        </div>

        {/* Step 1: Body metrics */}
        {step === 1 && (
          <div className="step-card">
            <h2>Tes données physiques</h2>
            <p>Pour calculer ton BMR et TDEE personnalisé</p>
            <div className="onboard-fields">
              <div className="fields-row">
                <div className="field">
                  <label>Âge</label>
                  <div className="input-unit">
                    <input 
                      type="number" 
                      value={formData.age} 
                      onChange={(e) => updateField('age', e.target.value)} 
                      placeholder="25" 
                    />
                    <span>ans</span>
                  </div>
                </div>
                <div className="field">
                  <label>Genre</label>
                  <div className="choice-row">
                    <button 
                      className={`choice-btn ${formData.gender === 'homme' ? 'active' : ''}`}
                      onClick={() => updateField('gender', 'homme')}
                    >
                      <i className="ph ph-gender-male"></i> Homme
                    </button>
                    <button 
                      className={`choice-btn ${formData.gender === 'femme' ? 'active' : ''}`}
                      onClick={() => updateField('gender', 'femme')}
                    >
                      <i className="ph ph-gender-female"></i> Femme
                    </button>
                  </div>
                </div>
              </div>
              <div className="fields-row">
                <div className="field">
                  <label>Poids</label>
                  <div className="input-unit">
                    <input 
                      type="number" 
                      value={formData.weight_kg} 
                      onChange={(e) => updateField('weight_kg', e.target.value)} 
                      placeholder="75" 
                    />
                    <span>kg</span>
                  </div>
                </div>
                <div className="field">
                  <label>Taille</label>
                  <div className="input-unit">
                    <input 
                      type="number" 
                      value={formData.height_cm} 
                      onChange={(e) => updateField('height_cm', e.target.value)} 
                      placeholder="175" 
                    />
                    <span>cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div className="step-card">
            <h2>Ton objectif principal</h2>
            <p>Le bot adaptera ses réponses et tes macros en conséquence</p>
            <div className="goal-cards">
              <button 
                type="button"
                className={`goal-card ${formData.goal === 'perte_poids' ? 'active' : ''}`} 
                onClick={() => updateField('goal', 'perte_poids')}
              >
                <div className="goal-icon"><i className="ph ph-fire"></i></div>
                <h3>Perte de poids</h3>
                <p>Déficit calorique · Cardio · Fat loss</p>
              </button>
              <button 
                type="button"
                className={`goal-card ${formData.goal === 'musculation' ? 'active' : ''}`} 
                onClick={() => updateField('goal', 'musculation')}
              >
                <div className="goal-icon"><i className="ph ph-barbell"></i></div>
                <h3>Musculation</h3>
                <p>Surplus calorique · Force · Masse musculaire</p>
              </button>
              <button 
                type="button"
                className={`goal-card ${formData.goal === 'maintien' ? 'active' : ''}`} 
                onClick={() => updateField('goal', 'maintien')}
              >
                <div className="goal-icon"><i className="ph ph-scales"></i></div>
                <h3>Maintien</h3>
                <p>Stabilité · Forme générale · Santé</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Level + Equipment */}
        {step === 3 && (
          <div className="step-card">
            <h2>Ton niveau et équipement</h2>
            <p>Pour filtrer les exercices et adapter la difficulté</p>
            <div className="field" style={{ marginBottom: "28px" }}>
              <label>Niveau</label>
              <div className="choice-row">
                {['débutant', 'intermédiaire', 'avancé'].map(lv => (
                  <button 
                    key={lv}
                    className={`choice-btn ${formData.level === lv ? 'active' : ''}`}
                    onClick={() => updateField('level', lv)}
                  >
                    <i className={`ph ph-${lv === 'débutant' ? 'plant' : lv === 'intermédiaire' ? 'lightning' : 'fire'}`}></i> 
                    {lv.charAt(0).toUpperCase() + lv.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginBottom: "28px" }}>
              <label>Équipement disponible</label>
              <div className="choice-row">
                <button 
                  className={`choice-btn ${formData.equipment === 'salle' ? 'active' : ''}`}
                  onClick={() => updateField('equipment', 'salle')}
                >
                  <i className="ph ph-barbell"></i> Salle
                </button>
                <button 
                  className={`choice-btn ${formData.equipment === 'maison' ? 'active' : ''}`}
                  onClick={() => updateField('equipment', 'maison')}
                >
                  <i className="ph ph-house"></i> Maison
                </button>
                <button 
                  className={`choice-btn ${formData.equipment === 'aucun' ? 'active' : ''}`}
                  onClick={() => updateField('equipment', 'aucun')}
                >
                  <i className="ph ph-person-simple-jump"></i> Aucun
                </button>
              </div>
            </div>
            <div className="field">
              <label>Jours d'entraînement par semaine</label>
              <div className="days-row">
                {[2, 3, 4, 5, 6].map(d => (
                  <button 
                    type="button"
                    key={d}
                    className={`day-btn ${formData.days_per_week === d ? 'active' : ''}`}
                    onClick={() => updateField('days_per_week', d)}
                  >
                    {d}j
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Language */}
        {step === 4 && (
          <div className="step-card">
            <h2>Langue préférée</h2>
            <p>FitBot te répondra dans cette langue par défaut</p>
            <div className="lang-cards">
              {[
                { id: 'fr', icon: 'ph-globe', label: 'Français' },
                { id: 'darija', icon: 'ph-globe', label: 'Darija' },
                { id: 'ar', icon: 'ph-globe', label: 'العربية' },
                { id: 'en', icon: 'ph-globe', label: 'English' }
              ].map(lang => (
                <button 
                  type="button"
                  key={lang.id}
                  className={`lang-card ${formData.language === lang.id ? 'active' : ''}`}
                  onClick={() => updateField('language', lang.id)}
                >
                  <i className={`ph ${lang.icon} lang-flag`}></i>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboard-nav">
          <button 
            className="btn-ghost" 
            onClick={prevStep} 
            style={{ visibility: step > 1 ? "visible" : "hidden" }}
          >
            <i className="ph ph-arrow-left"></i> Retour
          </button>
          <button className="btn-primary" onClick={nextStep} disabled={loading}>
            {loading ? 'Enregistrement...' : step === 4 ? 'Terminer' : 'Continuer'} <i className="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
