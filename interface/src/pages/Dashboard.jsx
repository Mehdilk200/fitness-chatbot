import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import faceImg from '../assets/face.jpg';
import backImg from '../assets/back.jpg';
import logoImg from '../assets/logoelet.png';
import colorMap from '../../../backend/data/color_map.json';
import ScheduleView from '../components/ScheduleView';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const muscleToApiMap = {
  "Pectoralis Major (Chest)": "pectorals",
  "Deltoids (Shoulders)": "shoulders",
  "Latissimus Dorsi (Lats)": "lats",
  "Biceps Brachii": "biceps",
  "Triceps Brachii": "triceps",
  "Rectus Abdominis (Abs)": "abs",
  "Serratus Anterior & External Obliques": "abs",
  "Erector Spinae (Lower Back)": "spine",
  "Trapezius (Upper Back / Neck)": "trapezius",
  "Forearms (Brachioradialis / Extensors)": "forearms",
  "Rectus Femoris (Quadriceps)": "quads",
  "Vastus Lateralis (Quadriceps)": "quads",
  "Vastus Medialis (Quadriceps)": "quads",
  "Hamstrings (Biceps Femoris)": "hamstrings",
  "Gluteus Maximus & Medius (Glutes)": "glutes",
  "Gastrocnemius & Soleus (Calves)": "calves"
};

export default function Dashboard({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('Nutrition');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState({ email: 'elgrand.medl.020@gmail.com' });
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Nutrition Graphe Data
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Steps',
      data: [4000, 8500, 6000, 7500, 9000, 11000, 9500],
      borderColor: '#c8f135',
      backgroundColor: 'rgba(200, 241, 53, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
    }]
  };

  const caloriesData = {
    datasets: [{
      data: [95.5, 4.5],
      backgroundColor: ['#c8f135', '#222'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '85%'
    }]
  };

  // Workouts Line Chart V3
  const workoutChartData = {
    labels: ['2 Aug', '3 Aug', '4 Aug', '5 Aug', '6 Aug', '7 Aug', '8 Aug'],
    datasets: [{
      label: 'Distance',
      data: [5, 6.2, 4.8, 8.5, 5.5, 7.6, 6.9],
      borderColor: '#c8f135',
      backgroundColor: 'rgba(200, 241, 53, 0.05)',
      tension: 0.4,
      fill: true,
      pointRadius: (ctx) => ctx.dataIndex === 5 ? 8 : 4,
      pointBorderWidth: (ctx) => ctx.dataIndex === 5 ? 4 : 2,
      pointBorderColor: '#fff',
      pointBackgroundColor: (ctx) => ctx.dataIndex === 5 ? '#ff5c5c' : '#c8f135',
    }]
  };

  // AI Coach State
  const [selectedMuscle, setSelectedMuscle] = useState(colorMap[0]);
  const [muscleSearch, setMuscleSearch] = useState('');
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [loadingEx, setLoadingEx] = useState(false);

  // Filter muscles based on search
  const filteredMuscles = colorMap.filter(m => 
    m["muscle name"].toLowerCase().includes(muscleSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchExercises = async () => {
      setLoadingEx(true);
      try {
        const apiMuscle = muscleToApiMap[selectedMuscle["muscle name"]] || "pectorals";
        const response = await fetch(`https://oss.exercisedb.dev/api/v1/exercises/muscles?targetMuscles=${apiMuscle}&limit=10`);
        const data = await response.json();
        if (data.success) {
          setExercises(data.data);
          setCurrentExIndex(0);
        }
      } catch (err) {
        console.error("Error fetching exercises:", err);
      } finally {
        setLoadingEx(false);
      }
    };

    if (activeTab === 'AI Coach') {
      fetchExercises();
    }
  }, [activeTab, selectedMuscle]);

  const nextEx = () => setCurrentExIndex(prev => (prev + 1) % exercises.length);

  return (

    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo logo-img-wrap">
            <img src={logoImg} alt="ELITEFIT" className="logo-img" />
            <span className="logo-text">ELITEFI<span>T</span></span>
          </Link>
          <button className="sidebar-close" onClick={toggleSidebar}><i className="ph ph-x"></i></button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/chat" className="nav-item"><span className="ni"><i className="ph ph-chat-circle-text"></i></span>Chat</Link>
          <Link to="/dashboard" className="nav-item active"><span className="ni"><i className="ph ph-chart-bar"></i></span>Dashboard</Link>
          <Link to="/profile" className="nav-item"><span className="ni"><i className="ph ph-user"></i></span>Profil</Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">E</div>
            <div className="user-details">
              <span>{user.email}</span>
              <span className="user-plan">Plan Gratuit</span>
            </div>
          </div>
          <button className="btn-logout" onClick={() => { localStorage.clear(); navigate('/auth'); }}>Déconnexion</button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-content compact">
          {/* Header & Tabs */}
          <div className="dash-header-top">
            <div className="dash-nav-pills">
              {['Workouts', 'Nutrition', 'AI Coach', 'Metrics'].map(tab => (
                <button 
                  key={tab} 
                  className={`nav-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="topbar-btn"><i className="ph ph-magnifying-glass"></i></button>
              <button className="topbar-btn" style={{ background: 'var(--bg-card)', borderRadius: '12px', width: 'auto', padding: '0 12px', gap: '8px', fontSize: '12px', fontWeight: '700' }}><i className="ph ph-calendar"></i> Calendar</button>
              <Link to="/profile" className="btn-primary" style={{ borderRadius: '12px', padding: '6px 12px', fontSize: '12px' }}><i className="ph ph-user-circle"></i> Mon profil</Link>
              <button className="btn-primary" style={{ borderRadius: '12px', padding: '6px 12px', fontSize: '12px' }}><i className="ph ph-chat-circle"></i> ChatBot AI</button>
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>

          {activeTab === 'Nutrition' && (
            <>
              <div className="dash-user-greet">
                <h1 style={{ fontSize: '24px' }}>Welcome Back, Alex! Let's crush today</h1>
                <p style={{ fontSize: '13px' }}>Here's what's happening at your gym today</p>
              </div>

              <div className="daily-tasks-row">
                {['Today\'s plan', 'Sleep', 'Steps', 'Food', 'Heart'].map((t, idx) => (
                  <div key={t} className="task-card-mini">
                    <div className="label" style={{ fontSize: '11px' }}>{t}</div>
                    {idx === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="plan-progress-circle" style={{ width: '32px', height: '32px', borderTopColor: '#ff5c5c', fontSize: '10px', borderThickness: '3px' }}>80%</div>
                        <div style={{ fontSize: '10px', fontWeight: '600', lineHeight: 1.1 }}>3 goals out of 6 completed</div>
                      </div>
                    ) : (
                      <div className="value" style={{ fontSize: '18px' }}>{idx === 1 ? '8.3 hr' : idx === 2 ? '2376' : idx === 3 ? '1200 kkal' : '63 bpm'}</div>
                    )}
                    <div className="icon-box" style={{ fontSize: '16px', opacity: 0.3 }}><i className={`ph ph-${['chart-pie', 'moon', 'footprints', 'fork-knife', 'heartbeat'][idx]}`}></i></div>
                  </div>
                ))}
              </div>

              <div className="dash-grid-v2">
                <div className="col-overview" style={{ gridColumn: 'span 3' }}>
                  <div className="card-v2">
                    <div className="card-v2-header"><h3>Overview</h3></div>
                    <div className="overview-content" style={{ gap: '12px' }}>
                      <div style={{ width: '80px', position: 'relative' }}>
                        <Doughnut data={{ datasets: [{ data: [65, 35], backgroundColor: ['#c8f135', '#222'], borderWidth: 0, cutout: '80%' }] }} options={{ plugins: { legend: { display: false } } }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>+23%</div>
                      </div>
                      <div className="legend-list" style={{ gap: '4px' }}>
                        <div className="legend-item" style={{ fontSize: '10px' }}><div className="legend-info"><div className="dot-v2" style={{ width: '6px', height: '6px', background: '#c8f135' }}></div> Cal.</div> <strong>33.5%</strong></div>
                        <div className="legend-item" style={{ fontSize: '10px' }}><div className="legend-info"><div className="dot-v2" style={{ width: '6px', height: '6px', background: '#ff5c5c' }}></div> Prot.</div> <strong>23.0%</strong></div>
                        <div className="legend-item" style={{ fontSize: '10px' }}><div className="legend-info"><div className="dot-v2" style={{ width: '6px', height: '6px', background: 'white' }}></div> Carb.</div> <strong>11.2%</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-calories" style={{ gridColumn: 'span 3' }}>
                  <div className="card-v2">
                    <div className="card-v2-header"><h3>Calories</h3></div>
                    <div style={{ position: 'relative', height: '100px' }}>
                      <Doughnut data={caloriesData} options={{ plugins: { legend: { display: false } } }} />
                      <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>95.50%</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Based on workout</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-activity" style={{ gridColumn: 'span 6' }}>
                  <div className="card-v2">
                    <div className="card-v2-header"><h3>Fitness activity</h3></div>
                    <div style={{ height: '100px' }}><Line data={activityData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} /></div>
                  </div>
                </div>
              </div>

              <div className="dash-grid-v2">
                <div className="col-8">
                  <div className="trainers-section">
                    <div className="card-v2-header"><h3>Popular trainer</h3></div>
                    <div className="trainers-row">
                      {['John Arnold', 'Adam Smith', 'Tim Cock'].map((name, i) => (
                        <div key={name} className="trainer-card">
                          <img src={`https://images.unsplash.com/photo-${i === 0 ? '1534438327276-14e5300c3a48' : i === 1 ? '1550345332-09e3ac987658' : '1571019613454-1cb2f99b2d8b'}?auto=format&fit=crop&q=80&w=200`} alt={name} />
                          <div className="trainer-overlay">
                            <h4>{name}</h4>
                            <p style={{ margin: 0 }}>{i === 0 ? 'Six pack expert' : i === 1 ? 'MMA expert' : 'Fitness specialist'}</p>
                            <button className="btn-trainer" style={{ padding: '4px 8px', fontSize: '10px' }}>View profile</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="card-v2">
                    <div className="card-v2-header"><h3>Workout Stats</h3></div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '80px', position: 'relative' }}>
                        <Doughnut data={{ datasets: [{ data: [70, 30], backgroundColor: ['#c8f135', '#222'], borderWidth: 0, cutout: '80%' }] }} options={{ plugins: { legend: { display: false } } }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>35 min</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {['VO 2 max', 'Fat burning'].map((s, i) => (
                          <div key={s} className="stat-bar-group">
                            <div className="stat-bar-label" style={{ fontSize: '10px' }}><span>{s}</span> <span>{i === 0 ? '5' : '7'} min</span></div>
                            <div className="stat-bar-bg" style={{ height: '6px' }}><div className="stat-bar-fill" style={{ width: i === 0 ? '80%' : '60%', background: i === 0 ? '#ff5c5c' : '#c8f135' }}></div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Workouts' && (
            <div className="workout-container">
              <div className="workout-top-actions">
                <div className="dash-user-greet" style={{ marginBottom: 0 }}>
                  <h1 style={{ fontSize: '32px' }}>Workout Tracker</h1>
                  <p>Achieve Your Goals with Detailed Tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="activity-picker"><i className="ph ph-person-simple-run"></i> Running <i className="ph ph-caret-down"></i></div>
                  <button className="btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Add Activity</button>
                </div>
              </div>

              <div className="workout-main-grid">
                <div className="workout-left-col">
                  <div className="workout-card">
                    <div className="card-v2-header">
                      <h3>Activity</h3>
                      <div style={{ background: 'var(--bg-elevated)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}><i className="ph ph-calendar"></i> Last 7 Days <i className="ph ph-caret-down"></i></div>
                    </div>
                    <div style={{ height: '200px' }}>
                      <Line data={workoutChartData} options={{ 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } },
                        scales: { x: { grid: { display: false } }, y: { border: { dash: [5, 5] } } }
                      }} />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '16px', fontWeight: '800' }}>7.6 km</div>
                    
                    <div className="metrics-v3">
                      <div className="m-card-v3 blue"><i className="ph ph-path"></i><span className="lab">Total Distance</span><span className="val">415.2 km</span></div>
                      <div className="m-card-v3 yellow"><i className="ph ph-footprints"></i><span className="lab">Total Steps</span><span className="val">58,827</span></div>
                      <div className="m-card-v3 lime"><i className="ph ph-fire"></i><span className="lab">Total Calories</span><span className="val">25,800 cal</span></div>
                      <div className="m-card-v3 purple"><i className="ph ph-clock"></i><span className="lab">Total Time</span><span className="val">51 hrs 36 mins</span></div>
                    </div>
                  </div>

                  <div className="workout-card" style={{ marginTop: '24px' }}>
                    <div className="card-v2-header"><h3>Goals</h3><i className="ph ph-dots-three"></i></div>
                    <div className="goals-v3">
                      <div className="goal-box">
                        <div className="goal-icon-v3" style={{ background: 'rgba(84, 160, 255, 0.1)', color: '#54a0ff' }}><i className="ph ph-footprints"></i></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                            <span>Steps</span><span>10,000 / day</span>
                          </div>
                          <div className="stat-bar-bg"><div className="stat-bar-fill" style={{ width: '75%', background: '#c8f135' }}></div></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <span>7,500 steps</span><span>75%</span>
                          </div>
                        </div>
                      </div>
                      <div className="goal-box">
                        <div className="goal-icon-v3" style={{ background: 'rgba(255, 159, 67, 0.1)', color: '#ff9f43' }}><i className="ph ph-scales"></i></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                            <span>Weight</span><span>72 kg</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span>Current 80 kg</span><span>Target -8 kg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="workout-right-col">
                  <div className="map-v3">
                    <div className="map-v3-overlay">
                      <div className="map-v3-search">
                        <input type="text" placeholder="Search Route" defaultValue="Central Park, Manhattan" />
                        <button type="button" className="map-search-btn">Search</button>
                      </div>
                      <div className="zoom-ctrls">
                        <button className="zoom-btn" style={{ width: '32px', height: '32px', borderRadius: '6px' }}>+</button>
                        <button className="zoom-btn" style={{ width: '32px', height: '32px', borderRadius: '6px' }}>-</button>
                      </div>
                    </div>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1200 540">
                      <path d="M400,100 L500,80 L600,120 L700,90 L850,200 L800,300 L600,350 L450,300 L400,200 Z" fill="rgba(200, 241, 53, 0.1)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
                      <circle cx="400" cy="100" r="10" fill="#000" />
                      <circle cx="400" cy="100" r="6" fill="#c8f135" />
                    </svg>
                  </div>

                  <div className="summary-v3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(84, 160, 255, 0.1)', color: '#54a0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph ph-person-simple-run"></i></div>
                        Running Activity
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#afb42b' }}><i className="ph ph-calendar"></i> Today <i className="ph ph-caret-down"></i></div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Start</div>
                         <div style={{ fontSize: '15px', fontWeight: '800' }}>Central Park Entrance</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><i className="ph ph-clock"></i> 6:30 AM</div>
                       </div>
                       <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                         <div style={{ fontSize: '12px', fontWeight: '800', background: 'var(--bg-card)', padding: '0 8px', position: 'relative', zIndex: 1 }}>8 km</div>
                         <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', borderBottom: '2px dashed var(--border)', zIndex: 0 }}></div>
                       </div>
                       <div style={{ flex: 1, textAlign: 'right' }}>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Finish</div>
                         <div style={{ fontSize: '15px', fontWeight: '800' }}>Central Park North Gate</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><i className="ph ph-clock"></i> 7:20 AM</div>
                       </div>
                    </div>

                    <div className="summary-details-grid">
                      <div className="detail-box"><span className="val">50</span><span className="lab">mins</span></div>
                      <div className="detail-box"><span className="val">10,500</span><span className="lab">steps</span></div>
                      <div className="detail-box"><span className="val">10</span><span className="lab">mins/km</span></div>
                      <div className="detail-box"><span className="val">450</span><span className="lab">cal</span></div>
                      
                      <div className="heart-widget" style={{ padding: '16px', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.7 }}>Heart Beat <i className="ph ph-heart"></i></div>
                        <div style={{ display: 'flex', gap: '24px', margin: '8px 0' }}>
                          <div><div style={{ fontSize: '10px', opacity: 0.6 }}>Average</div><div style={{ fontSize: '18px', fontWeight: '800' }}>140 bpm</div></div>
                          <div><div style={{ fontSize: '10px', opacity: 0.6 }}>Peak</div><div style={{ fontSize: '18px', fontWeight: '800' }}>160 bpm</div></div>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#2e7d32' }}><i className="ph ph-trend-up"></i> 3.5% vs last day</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'AI Coach' && (
            <div className="ai-coach-view">
              <div className="ai-coach-grid">
                {/* Left Card: Musculature Anatomy */}
                <div className="coach-card anatomy-card">
                  <h2 className="coach-title">Musculature Anatomy</h2>
                  <div className="muscle-search-box">
                    <input 
                      type="text" 
                      placeholder="Search muscle..." 
                      value={muscleSearch}
                      onChange={(e) => {
                        setMuscleSearch(e.target.value);
                        setShowMuscleDropdown(true);
                      }}
                      onFocus={() => setShowMuscleDropdown(true)}
                      className="muscle-search-input"
                    />
                    <button 
                      className="muscle-dropdown-btn" 
                      onClick={() => setShowMuscleDropdown(!showMuscleDropdown)}
                    >
                      <i className="ph ph-list"></i>
                    </button>
                    {showMuscleDropdown && (
                      <div className="muscle-dropdown">
                        {filteredMuscles.map((muscle, idx) => (
                          <button 
                            key={idx}
                            className="muscle-option"
                            onClick={() => {
                              setSelectedMuscle(muscle);
                              setMuscleSearch('');
                              setShowMuscleDropdown(false);
                            }}
                          >
                            <div className="muscle-opt-color" style={{ background: muscle.hex }}></div>
                            <span>{muscle["muscle name"]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="muscle-indicator">
                    <div className="muscle-color-box" style={{ background: selectedMuscle.hex }}></div>
                    <div className="muscle-info-text">
                      <h3>{selectedMuscle["muscle name"]}</h3>
                    </div>
                  </div>
                  
                  <div className="anatomy-images">
                    <div className="anatomy-img-box">
                      <img src={faceImg} alt="Anatomy Front" className="anatomy-image" />
                      <svg className="anatomy-overlay" viewBox="0 0 300 400">
                        {/* Pectoralis (Chest) - Center chest area */}
                        <circle cx="150" cy="120" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Pectoralis Major (Chest)"))} title="Pectoralis Major (Chest)" />
                        {/* Deltoids (Shoulders) - Shoulder area */}
                        <circle cx="90" cy="90" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Deltoids (Shoulders)"))} title="Deltoids (Shoulders)" />
                        <circle cx="210" cy="90" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Deltoids (Shoulders)"))} title="Deltoids (Shoulders)" />
                        {/* Biceps - Upper arm */}
                        <circle cx="60" cy="140" r="12" fill="rgba(239, 202, 202, 0.6)" stroke="rgba(239, 202, 202, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Biceps Brachii"))} title="Biceps Brachii" />
                        <circle cx="240" cy="140" r="12" fill="rgba(239, 202, 202, 0.6)" stroke="rgba(239, 202, 202, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Biceps Brachii"))} title="Biceps Brachii" />
                        {/* Abs - Center abdomen */}
                        <circle cx="150" cy="200" r="14" fill="rgba(163, 56, 93, 0.6)" stroke="rgba(163, 56, 93, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Rectus Abdominis (Abs)"))} title="Rectus Abdominis (Abs)" />
                        {/* Quadriceps - Thigh */}
                        <circle cx="130" cy="290" r="14" fill="rgba(108, 91, 147, 0.6)" stroke="rgba(108, 91, 147, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Rectus Femoris (Quadriceps)"))} title="Rectus Femoris (Quadriceps)" />
                        <circle cx="170" cy="290" r="14" fill="rgba(74, 123, 176, 0.6)" stroke="rgba(74, 123, 176, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Vastus Medialis (Quadriceps)"))} title="Vastus Medialis (Quadriceps)" />
                        {/* Calves - Lower leg */}
                        <circle cx="130" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                        <circle cx="170" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                      </svg>
                    </div>
                    <div className="anatomy-img-box">
                      <img src={backImg} alt="Anatomy Back" className="anatomy-image" />
                      <svg className="anatomy-overlay" viewBox="0 0 300 400">
                        {/* Trapezius - Upper back/neck */}
                        <circle cx="150" cy="70" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Trapezius (Upper Back / Neck)"))} title="Trapezius (Upper Back / Neck)" />
                        {/* Lats - Back middle */}
                        <circle cx="130" cy="160" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Latissimus Dorsi (Lats)"))} title="Latissimus Dorsi (Lats)" />
                        <circle cx="170" cy="160" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Latissimus Dorsi (Lats)"))} title="Latissimus Dorsi (Lats)" />
                        {/* Erector Spinae (Lower back) - Center lower back */}
                        <circle cx="150" cy="240" r="14" fill="rgba(163, 56, 93, 0.6)" stroke="rgba(163, 56, 93, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Erector Spinae (Lower Back)"))} title="Erector Spinae (Lower Back)" />
                        {/* Glutes - Buttocks */}
                        <circle cx="130" cy="300" r="14" fill="rgba(108, 91, 147, 0.6)" stroke="rgba(108, 91, 147, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gluteus Maximus & Medius (Glutes)"))} title="Gluteus Maximus & Medius (Glutes)" />
                        <circle cx="170" cy="300" r="14" fill="rgba(108, 91, 147, 0.6)" stroke="rgba(108, 91, 147, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gluteus Maximus & Medius (Glutes)"))} title="Gluteus Maximus & Medius (Glutes)" />
                        {/* Hamstrings - Back thigh */}
                        <circle cx="130" cy="280" r="12" fill="rgba(74, 123, 176, 0.6)" stroke="rgba(74, 123, 176, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Hamstrings (Biceps Femoris)"))} title="Hamstrings (Biceps Femoris)" />
                        <circle cx="170" cy="280" r="12" fill="rgba(74, 123, 176, 0.6)" stroke="rgba(74, 123, 176, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Hamstrings (Biceps Femoris)"))} title="Hamstrings (Biceps Femoris)" />
                        {/* Calves - Back lower leg */}
                        <circle cx="130" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                        <circle cx="170" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="ai-coach-right">
                  {/* Exercise Card */}
                  <div className="coach-card exercise-card">
                    <h2 className="coach-title">{selectedMuscle["muscle name"].split('(')[1]?.replace(')', '') || 'Muscle'} Exercises</h2>
                    <div className="exercise-display">
                      {loadingEx ? (
                        <div className="loading-spinner">Loading exercises...</div>
                      ) : exercises.length > 0 ? (
                        <div className="exercise-gif-container">
                          <img src={exercises[currentExIndex].gifUrl} alt={exercises[currentExIndex].name} />
                          <div className="carousel-nav">
                            <div className="carousel-dots">
                              {exercises.slice(0, 3).map((_, idx) => (
                                <div key={idx} className={`dot ${idx === currentExIndex % 3 ? 'active' : ''}`}></div>
                              ))}
                            </div>
                            <button className="carousel-next" onClick={nextEx}><i className="ph ph-arrow-right"></i></button>
                          </div>
                        </div>
                      ) : (
                        <div className="no-data">No exercises found for this muscle.</div>
                      )}
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="coach-card description-card">
                    <h2 className="coach-title">description</h2>
                    <div className="description-text">
                      {exercises.length > 0 && !loadingEx ? (
                        <div>
                          {exercises[currentExIndex].instructions.map((instruction, idx) => {
                            const cleanedInstruction = instruction.replace(/^Step[\s:]*\d+[\s:]*/, '');
                            return (
                              <div key={idx} className="description-step">
                                <span className="description-step-num">Step {idx + 1}:</span>
                                {' '}{cleanedInstruction}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p>Select a muscle to see exercise details.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Metrics' && (
            <ScheduleView />
          )}
        </div>

      </main>
    </div>
  );
}
