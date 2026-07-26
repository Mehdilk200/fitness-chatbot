import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { authApi } from '../services/api';
import Sidebar from './Sidebar';
import ToastContainer from './Toast';
import logoImg from '../assets/logoelet.png';

const SEARCH_EXERCISES = [
  { name: 'Bench Press', category: 'Chest', type: 'Strength' },
  { name: 'Squat', category: 'Legs', type: 'Strength' },
  { name: 'Deadlift', category: 'Back', type: 'Strength' },
  { name: 'Overhead Press', category: 'Shoulders', type: 'Strength' },
  { name: 'Pull Up', category: 'Back', type: 'Strength' },
  { name: 'Running', category: 'Cardio', type: 'Cardio' },
  { name: 'Cycling', category: 'Cardio', type: 'Cardio' },
  { name: 'Swimming', category: 'Cardio', type: 'Cardio' },
  { name: 'Bicep Curl', category: 'Arms', type: 'Strength' },
  { name: 'Tricep Dip', category: 'Arms', type: 'Strength' },
  { name: 'Leg Press', category: 'Legs', type: 'Strength' },
  { name: 'Lat Pulldown', category: 'Back', type: 'Strength' },
  { name: 'Cable Fly', category: 'Chest', type: 'Strength' },
  { name: 'Plank', category: 'Core', type: 'Strength' },
  { name: 'Burpee', category: 'Full Body', type: 'Cardio' },
  { name: 'Jump Rope', category: 'Cardio', type: 'Cardio' },
  { name: 'Rowing', category: 'Cardio', type: 'Cardio' },
  { name: 'Dumbbell Row', category: 'Back', type: 'Strength' },
  { name: 'Lateral Raise', category: 'Shoulders', type: 'Strength' },
  { name: 'Romanian Deadlift', category: 'Hamstrings', type: 'Strength' },
];

const SEARCH_FOODS = [
  { name: 'Chicken Breast', calories: 165, protein: 31, category: 'Meat' },
  { name: 'Brown Rice', calories: 216, protein: 5, category: 'Grains' },
  { name: 'Salmon', calories: 208, protein: 22, category: 'Fish' },
  { name: 'Eggs', calories: 155, protein: 13, category: 'Dairy' },
  { name: 'Oats', calories: 154, protein: 5, category: 'Grains' },
  { name: 'Banana', calories: 105, protein: 1, category: 'Fruit' },
  { name: 'Greek Yogurt', calories: 100, protein: 17, category: 'Dairy' },
  { name: 'Broccoli', calories: 55, protein: 4, category: 'Vegetables' },
  { name: 'Sweet Potato', calories: 112, protein: 2, category: 'Vegetables' },
  { name: 'Almonds', calories: 164, protein: 6, category: 'Nuts' },
  { name: 'Whey Protein', calories: 120, protein: 24, category: 'Supplements' },
  { name: 'Avocado', calories: 160, protein: 2, category: 'Fruit' },
  { name: 'Quinoa', calories: 222, protein: 8, category: 'Grains' },
  { name: 'Beef Steak', calories: 271, protein: 26, category: 'Meat' },
  { name: 'Tuna', calories: 132, protein: 28, category: 'Fish' },
];

const MOBILE_TABS = [
  { key: 'Workouts', icon: 'ph-person-simple-run', label: 'Workouts' },
  { key: 'Nutrition', icon: 'ph-bowl-food', label: 'Nutrition' },
  { key: 'ChatBot AI', icon: 'ph-chat-circle-text', label: 'Chat', isLink: true, path: '/chat' },
  { key: 'Metrics', icon: 'ph-chart-line-up', label: 'Metrics' },
  {
    key: 'AI Coach',
    icon: 'ph-dumbbell',
    label: 'Coach',
    iconSvg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h3v12H6z"/><path d="M15 6h3v12h-3z"/><rect x="3" y="8" width="3" height="8" rx="1"/><rect x="18" y="8" width="3" height="8" rx="1"/><line x1="6" y1="10" x2="15" y2="10"/><line x1="6" y1="14" x2="15" y2="14"/></svg>,
  },
];

export default function AppLayout({ theme, toggleTheme }) {
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('?');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const settingsRef = useRef(null);
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isTabActive = (tab) => {
    if (tab.isLink) return location.pathname === tab.path;
    return location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === tab.key;
  };

  const handleTabClick = (tab) => {
    setSettingsOpen(false);
    if (tab.isLink) {
      navigate(tab.path);
    } else {
      navigate(`/dashboard?tab=${tab.key}`);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authApi.getMe();
        setUserEmail(data.email);
        const initials = ((data.first_name?.[0] || '') + (data.last_name?.[0] || '')).toUpperCase();
        setUserInitials(initials || data.email?.charAt(0).toUpperCase() || '?');
      } catch {
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { exercises: [], foods: [], metrics: [] };
    const q = searchQuery.toLowerCase();
    return {
      exercises: SEARCH_EXERCISES.filter(e => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)),
      foods: SEARCH_FOODS.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)),
      metrics: [],
    };
  }, [searchQuery]);

  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    setShowSearchResults(query.trim().length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_profile_complete');
    navigate('/auth');
  };

  return (
    <div className="app-shell">
      <div className="mobile-header-wrapper">
        <div className="mobile-topbar">
          <Link to="/" className="logo-img-wrap" style={{ textDecoration: 'none' }}>
            <img src={logoImg} alt="ELITEFIT" className="logo-img" />
            <span className="logo-text">ELITEFI<span>T</span></span>
          </Link>
          <div className="mobile-topbar-right">
            <div className="settings-wrap" ref={settingsRef}>
              <button className="settings-icon" onClick={() => setSettingsOpen(!settingsOpen)}>
                <i className="ph ph-gear-six"></i>
              </button>
              {settingsOpen && (
                <div className="settings-dropdown">
                  <div className="settings-user">
                    <div className="settings-avatar">{userInitials}</div>
                    <div className="settings-user-info">
                      <span className="settings-email">{userEmail}</span>
                      <span className="settings-plan">Plan Gratuit</span>
                    </div>
                  </div>
                  <button className="settings-link" onClick={() => { toggleTheme(); setSettingsOpen(false); }}>
                    <i className={`ph ${theme === 'light' ? 'ph-moon' : 'ph-sun'}`}></i>
                    {theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
                  </button>
                  <Link to="/chat" className="settings-link" onClick={() => setSettingsOpen(false)}>
                    <i className="ph ph-chat-circle-text"></i> ChatBot AI
                  </Link>
                  <Link to="/profile" className="settings-link" onClick={() => setSettingsOpen(false)}>
                    <i className="ph ph-user-circle"></i> Mon profil
                  </Link>
                  <Link to="/dashboard" className="settings-link" onClick={() => setSettingsOpen(false)}>
                    <i className="ph ph-plugs"></i> Connected
                  </Link>
                  <button className="settings-link settings-logout" onClick={handleLogout}>
                    <i className="ph ph-sign-out"></i> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mobile-global-search" ref={searchRef}>
          <i className="ph ph-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search exercises, nutrition, metrics, or chat..."
            value={searchQuery}
            onChange={(e) => handleGlobalSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={clearSearch}><i className="ph ph-x"></i></button>
          )}
          {showSearchResults && (searchResults.exercises.length > 0 || searchResults.foods.length > 0) && (
            <div className="search-results-dropdown">
              {searchResults.exercises.length > 0 && (
                <div className="search-results-group">
                  <div className="search-results-group-title">Exercises</div>
                  {searchResults.exercises.slice(0, 5).map((ex, i) => (
                    <div key={i} className="search-result-item">
                      <i className="ph ph-dumbbell"></i>
                      <div className="search-result-info">
                        <span className="search-result-name">{ex.name}</span>
                        <span className="search-result-meta">{ex.category} · {ex.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.foods.length > 0 && (
                <div className="search-results-group">
                  <div className="search-results-group-title">Nutrition</div>
                  {searchResults.foods.slice(0, 5).map((f, i) => (
                    <div key={i} className="search-result-item">
                      <i className="ph ph-bowl-food"></i>
                      <div className="search-result-info">
                        <span className="search-result-name">{f.name}</span>
                        <span className="search-result-meta">{f.calories} kcal · {f.protein}g protein</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Sidebar userEmail={userEmail} initials={userInitials} />
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <Outlet context={{ userEmail }} />
      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-indicator" style={{ transform: `translateX(${MOBILE_TABS.findIndex(t => isTabActive(t)) * 100}%)` }} />
        {MOBILE_TABS.map(tab => {
          const cls = `mobile-nav-item${isTabActive(tab) ? ' active' : ''}`;
          return (
            <button key={tab.key} className={cls} onClick={() => handleTabClick(tab)}>
              {tab.iconSvg || <i className={`ph ${tab.icon}`}></i>}
              <span>{tab.label || tab.key}</span>
            </button>
          );
        })}
      </nav>
      <ToastContainer />
    </div>
  );
}
