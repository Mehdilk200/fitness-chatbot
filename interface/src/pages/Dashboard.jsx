import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import WearableModal from '../components/WearableModal';
import { authApi, wearableApi } from '../services/api';
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
import colorMap from '../../../backend/data/color_map.json';
import ScheduleView from '../components/ScheduleView';
import MapRunning from '../components/MapRunning';


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
  const { userEmail } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Nutrition');
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');

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

  // Workout Tab State
  const [activity, setActivity] = useState('Running');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  const timeRanges = ['today', 'week'];

  // Wearable device state (Strava / Fitbit)
  const [wearableConnected, setWearableConnected] = useState(false);
  const [wearableProviders, setWearableProviders] = useState([]);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);

  useEffect(() => {
    wearableApi.getStatus().then(res => {
      const conns = res.connections || [];
      setWearableProviders(conns);
      setWearableConnected(conns.some(c => c.connected));
    }).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    if (params.get('wearable') === 'connected') {
      setIsWearableModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('wearable_error')) {
      setIsWearableModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleWearableConnected = () => {
    wearableApi.getStatus().then(res => {
      const conns = res.connections || [];
      setWearableProviders(conns);
      setWearableConnected(conns.some(c => c.connected));
    }).catch(() => {});
  };

  const activities = [
    { id: 'Running', icon: 'ph-person-simple-run', label: 'Running' },
    { id: 'Cycling', icon: 'ph-bicycle', label: 'Cycling' },
    { id: 'Walking', icon: 'ph-person-simple-walk', label: 'Walking' },
  ];

  const activityDataMap = {
    Running: {
      icon: 'ph-person-simple-run',
      chartData: {
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
      },
      mainMetric: '7.6 km',
      metrics: [
        { className: 'blue', icon: 'ph-path', lab: 'Total Distance', val: '415.2 km' },
        { className: 'yellow', icon: 'ph-footprints', lab: 'Total Steps', val: '58,827' },
        { className: 'lime', icon: 'ph-fire', lab: 'Total Calories', val: '25,800 cal' },
        { className: 'purple', icon: 'ph-clock', lab: 'Total Time', val: '51 hrs 36 mins' },
      ],
      summary: {
        label: 'Running Activity',
        icon: 'ph-person-simple-run',
        start: { name: 'Central Park Entrance', time: '6:30 AM' },
        finish: { name: 'Central Park North Gate', time: '7:20 AM' },
        distance: '8 km',
        details: [
          { val: '50', lab: 'mins' },
          { val: '10,500', lab: 'steps' },
          { val: '10', lab: 'mins/km' },
          { val: '450', lab: 'cal' },
        ],
        heartRate: { avg: '140', peak: '160', trend: '+3.5%' },
      },
    },
    Cycling: {
      icon: 'ph-bicycle',
      chartData: {
        labels: ['2 Aug', '3 Aug', '4 Aug', '5 Aug', '6 Aug', '7 Aug', '8 Aug'],
        datasets: [{
          label: 'Distance',
          data: [12, 15.5, 10.2, 20.1, 14.8, 18.3, 16.7],
          borderColor: '#54a0ff',
          backgroundColor: 'rgba(84, 160, 255, 0.05)',
          tension: 0.4,
          fill: true,
          pointRadius: (ctx) => ctx.dataIndex === 5 ? 8 : 4,
          pointBorderWidth: (ctx) => ctx.dataIndex === 5 ? 4 : 2,
          pointBorderColor: '#fff',
          pointBackgroundColor: (ctx) => ctx.dataIndex === 5 ? '#ff5c5c' : '#54a0ff',
        }]
      },
      mainMetric: '18.3 km',
      metrics: [
        { className: 'blue', icon: 'ph-path', lab: 'Total Distance', val: '892.5 km' },
        { className: 'yellow', icon: 'ph-footprints', lab: 'Total Pedals', val: '124,830' },
        { className: 'lime', icon: 'ph-fire', lab: 'Total Calories', val: '38,200 cal' },
        { className: 'purple', icon: 'ph-clock', lab: 'Total Time', val: '42 hrs 18 mins' },
      ],
      summary: {
        label: 'Cycling Activity',
        icon: 'ph-bicycle',
        start: { name: 'Boulevard de la Corniche', time: '7:00 AM' },
        finish: { name: 'Ain Diab Beach', time: '8:15 AM' },
        distance: '18.3 km',
        details: [
          { val: '75', lab: 'mins' },
          { val: '18,500', lab: 'pedals' },
          { val: '24', lab: 'km/h' },
          { val: '680', lab: 'cal' },
        ],
        heartRate: { avg: '135', peak: '155', trend: '+2.1%' },
      },
    },
    Walking: {
      icon: 'ph-person-simple-walk',
      chartData: {
        labels: ['2 Aug', '3 Aug', '4 Aug', '5 Aug', '6 Aug', '7 Aug', '8 Aug'],
        datasets: [{
          label: 'Distance',
          data: [3.2, 4.1, 2.8, 5.5, 3.9, 4.8, 6.2],
          borderColor: '#ff9f43',
          backgroundColor: 'rgba(255, 159, 67, 0.05)',
          tension: 0.4,
          fill: true,
          pointRadius: (ctx) => ctx.dataIndex === 5 ? 8 : 4,
          pointBorderWidth: (ctx) => ctx.dataIndex === 5 ? 4 : 2,
          pointBorderColor: '#fff',
          pointBackgroundColor: (ctx) => ctx.dataIndex === 5 ? '#ff5c5c' : '#ff9f43',
        }]
      },
      mainMetric: '4.8 km',
      metrics: [
        { className: 'blue', icon: 'ph-path', lab: 'Total Distance', val: '285.4 km' },
        { className: 'yellow', icon: 'ph-footprints', lab: 'Total Steps', val: '92,450' },
        { className: 'lime', icon: 'ph-fire', lab: 'Total Calories', val: '12,600 cal' },
        { className: 'purple', icon: 'ph-clock', lab: 'Total Time', val: '68 hrs 12 mins' },
      ],
      summary: {
        label: 'Walking Activity',
        icon: 'ph-person-simple-walk',
        start: { name: 'Home', time: '6:00 AM' },
        finish: { name: 'Office', time: '7:15 AM' },
        distance: '4.8 km',
        details: [
          { val: '75', lab: 'mins' },
          { val: '8,200', lab: 'steps' },
          { val: '16', lab: 'mins/km' },
          { val: '280', lab: 'cal' },
        ],
        heartRate: { avg: '95', peak: '110', trend: '+1.2%' },
      },
    },
  };

  const currentActivity = activityDataMap[activity];

  const displayData = useMemo(() => {
    if (timeRange === 'today') {
      const ca = currentActivity;
      const lastVal = ca.chartData.datasets[0].data.slice(-1)[0];
      const lastLabel = ca.chartData.labels[ca.chartData.labels.length - 1];
      const divideVal = (v) => {
        const str = String(v);
        const num = parseFloat(str.replace(/,/g, ''));
        if (isNaN(num)) return v;
        return Math.round(num / 7).toLocaleString();
      };
      return {
        ...ca,
        chartData: {
          labels: [lastLabel],
          datasets: ca.chartData.datasets.map(ds => ({
            ...ds,
            data: [lastVal],
            pointRadius: 6,
            pointBorderWidth: 3,
          }))
        },
        mainMetric: `${lastVal} km`,
        metrics: ca.metrics.map(m => ({
          ...m,
          val: `${divideVal(m.val)}${m.val.includes('cal') ? ' cal' : m.val.includes('hrs') ? ' hrs' : m.val.includes('km') ? ' km' : ''}`
        })),
      };
    }
    return currentActivity;
  }, [timeRange, currentActivity]);

  // AI Coach State
  const [selectedMuscle, setSelectedMuscle] = useState(colorMap[0]);
  const [muscleSearch, setMuscleSearch] = useState('');
  const [showMuscleDropdown, setShowMuscleDropdown] = useState(false);
  const [anatomyView, setAnatomyView] = useState('front');
  const [exercises, setExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [loadingEx, setLoadingEx] = useState(false);

  const handleImageError = useCallback((index) => {
    const failedEx = exercises[index];
    if (failedEx) console.warn('Broken GIF link:', failedEx.gifUrl, '-', failedEx.name);
    setExercises(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered;
    });
  }, [exercises]);

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

  useEffect(() => {
    authApi.getMe().then(data => {
      if (data.first_name) setUserName(data.first_name);
      const full = [data.first_name, data.last_name].filter(Boolean).join(' ');
      if (full) setUserFullName(full);
    }).catch(() => {});
  }, []);

  const nextEx = () => setCurrentExIndex(prev => (prev + 1) % exercises.length);

  return (
    <main className="dash-main">
      <div className="dash-content compact">
          {/* Header & Tabs - desktop */}
          <div className="dash-header-top">
            <div className="dash-nav-pills">
              {['Workouts', 'Nutrition', 'AI Coach', 'Metrics'].map(tab => (
                <button 
                  key={tab} 
                  className={`nav-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => navigate('/dashboard?tab=' + tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="desktop-header-actions">
              <button className="topbar-btn" onClick={() => navigate('/chat')}><i className="ph ph-magnifying-glass"></i></button>
              <Link to="/profile" className="header-action-btn"><i className="ph ph-user-circle"></i> Mon profil</Link>
              <button className="header-action-btn" onClick={() => navigate('/chat')}><i className="ph ph-chat-circle"></i> ChatBot AI</button>
              <button className={`header-action-btn ${wearableConnected ? 'status-connected' : 'status-disconnected'}`} onClick={() => setIsWearableModalOpen(true)}>
                <i className={`ph ${wearableConnected ? 'ph-plugs-connected' : 'ph-plugs'}`}></i> Connected
              </button>
            </div>
          </div>

          <div key={activeTab} className="tab-content">
          {activeTab === 'Nutrition' && (
            <>
              <div className="dash-user-greet">
                <h1 style={{ fontSize: '24px' }}>Hello, {userName || 'Champion'}! Ready to dominate your workout today?</h1>
                <p style={{ fontSize: '13px' }}>Here's what's happening at your gym today</p>
              </div>

              <div className="daily-tasks-row">
                {['Today\'s plan', 'Sleep', 'Steps', 'Food', 'Heart'].map((t, idx) => (
                  <div key={t} className="task-card-mini">
                    <div className="label" style={{ fontSize: '11px' }}>{t}</div>
                    {idx === 0 ? (
                      <div className="plan-stats">
                        <span className="plan-pct">80%</span>
                        <span className="plan-sub">3 goals out of 6 completed</span>
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
                    <div className="overview-content">
                      <div style={{ position: 'relative' }}>
                        <Doughnut data={{ datasets: [{ data: [65, 35], backgroundColor: ['#c8f135', '#222'], borderWidth: 0, cutout: '80%' }] }} options={{ plugins: { legend: { display: false } } }} />
                        <div className="overview-center">+23%</div>
                      </div>
                      <div className="legend-list">
                        <div className="legend-item"><div className="legend-info"><span className="dot-v2" style={{ background: '#c8f135' }}></span> Cal.</div> <strong>33.5%</strong></div>
                        <div className="legend-item"><div className="legend-info"><span className="dot-v2" style={{ background: '#ff5c5c' }}></span> Prot.</div> <strong>23.0%</strong></div>
                        <div className="legend-item"><div className="legend-info"><span className="dot-v2" style={{ background: '#4a9eff' }}></span> Carb.</div> <strong>11.2%</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-calories" style={{ gridColumn: 'span 3' }}>
                  <div className="card-v2">
                    <div className="card-v2-header"><h3>Calories</h3></div>
                    <div className="calories-content">
                      <div className="calories-chart">
                        <Doughnut data={caloriesData} options={{ plugins: { legend: { display: false } } }} />
                      </div>
                      <div className="calories-stats">
                        <div className="calories-pct">95.50%</div>
                        <div className="calories-sub">Based on workout</div>
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
                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  <div className="activity-picker" onClick={() => setShowActivityDropdown(prev => !prev)}>
                    <i className={`ph ${currentActivity.icon}`}></i> {activity} <i className="ph ph-caret-down"></i>
                  </div>
                  {showActivityDropdown && (
                    <div className="activity-dropdown">
                      {activities.map(a => (
                        <div key={a.id} className={`activity-option ${activity === a.id ? 'active' : ''}`} onClick={() => { setActivity(a.id); setShowActivityDropdown(false); }}>
                          <i className={`ph ${a.icon}`}></i> {a.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Add Activity</button>
                </div>
              </div>

              <div className="workout-main-grid">
                <div className="workout-left-col">
                  <div className="workout-card">
                    <div className="card-v2-header">
                      <h3>Activity</h3>
                      <div className="time-range-toggle">
                        {timeRanges.map(t => (
                          <button key={t} className={`time-range-btn ${timeRange === t ? 'active' : ''}`} onClick={() => setTimeRange(t)}>{t === 'today' ? 'Today' : 'Week'}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ height: '200px' }}>
                      <Line data={displayData.chartData} options={{ 
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } },
                        scales: { x: { grid: { display: false } }, y: { border: { dash: [5, 5] } } }
                      }} />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '16px', fontWeight: '800' }}>{displayData.mainMetric}</div>
                    
                    <div className="metrics-v3">
                      {displayData.metrics.map((m, i) => (
                        <div key={i} className={`m-card-v3 ${m.className}`}>
                          <div className="m-card-v3-top"><i className={`ph ${m.icon}`}></i><span className="lab">{m.lab}</span></div>
                          <span className="val">{m.val}</span>
                        </div>
                      ))}
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
                  <MapRunning accessToken={import.meta.env.VITE_BOXMAP} />

                  <div className="summary-v3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(84, 160, 255, 0.1)', color: '#54a0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={`ph ${displayData.summary.icon}`}></i></div>
                        {displayData.summary.label}
                      </div>
                      <div className="time-range-toggle">
                        {timeRanges.map(t => (
                          <button key={t} className={`time-range-btn ${timeRange === t ? 'active' : ''}`} onClick={() => setTimeRange(t)}>{t === 'today' ? 'Today' : 'Week'}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '12px 0' }}>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Start</div>
                         <div style={{ fontSize: '15px', fontWeight: '800' }}>{displayData.summary.start.name}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><i className="ph ph-clock"></i> {displayData.summary.start.time}</div>
                       </div>
                       <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                         <div style={{ fontSize: '12px', fontWeight: '800', background: 'var(--bg-card)', padding: '0 8px', position: 'relative', zIndex: 1 }}>{displayData.summary.distance}</div>
                         <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', borderBottom: '2px dashed var(--border)', zIndex: 0 }}></div>
                       </div>
                       <div style={{ flex: 1, textAlign: 'right' }}>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Finish</div>
                         <div style={{ fontSize: '15px', fontWeight: '800' }}>{displayData.summary.finish.name}</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><i className="ph ph-clock"></i> {displayData.summary.finish.time}</div>
                       </div>
                    </div>

                    <div className="summary-details-grid">
                      {displayData.summary.details.map((d, i) => (
                        <div key={i} className="detail-box"><span className="val">{d.val}</span><span className="lab">{d.lab}</span></div>
                      ))}
                      <div className="heart-widget">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.7 }}>Heart Beat <i className="ph ph-heart"></i></div>
                        <div className="heart-row">
                          <div><span style={{ fontSize: '10px', opacity: 0.6 }}>Avg </span><span style={{ fontSize: '16px', fontWeight: '800' }}>{displayData.summary.heartRate.avg} bpm</span></div>
                          <div><span style={{ fontSize: '10px', opacity: 0.6 }}>Peak </span><span style={{ fontSize: '16px', fontWeight: '800' }}>{displayData.summary.heartRate.peak} bpm</span></div>
                          <span className="heart-trend"><i className="ph ph-trend-up"></i> {displayData.summary.heartRate.trend}</span>
                        </div>
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
                      <div className="muscle-search-inner">
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
                        <span className="muscle-search-divider"></span>
                        <button 
                          className="muscle-dropdown-btn" 
                          onClick={() => setShowMuscleDropdown(!showMuscleDropdown)}
                        >
                          <i className="ph ph-list"></i>
                        </button>
                      </div>
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
                  
                  <div className="anatomy-slider-wrapper">
                    <div className="anatomy-images">
                      <div className={`anatomy-img-box ${anatomyView === 'front' ? 'active' : ''}`}>
                        <img src={faceImg} alt="Anatomy Front" className="anatomy-image" />
                        <svg className="anatomy-overlay" viewBox="0 0 300 400">
                          {/* Pectoralis (Chest) - Center chest area */}
                          <circle cx="150" cy="120" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Pectoralis Major (Chest)"))} title="Pectoralis Major (Chest)" />
                          {/* Deltoids (Shoulders) - Shoulder area */}
                          <circle cx="85" cy="95" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Deltoids (Shoulders)"))} title="Deltoids (Shoulders)" />
                          <circle cx="215" cy="95" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Deltoids (Shoulders)"))} title="Deltoids (Shoulders)" />
                          {/* Biceps - Upper arm */}
                          <circle cx="55" cy="145" r="12" fill="rgba(239, 202, 202, 0.6)" stroke="rgba(239, 202, 202, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Biceps Brachii"))} title="Biceps Brachii" />
                          <circle cx="245" cy="145" r="12" fill="rgba(239, 202, 202, 0.6)" stroke="rgba(239, 202, 202, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Biceps Brachii"))} title="Biceps Brachii" />
                          {/* Forearms - Lower arm */}
                          <circle cx="55" cy="195" r="12" fill="rgba(200, 180, 160, 0.6)" stroke="rgba(200, 180, 160, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Forearms (Brachioradialis / Extensors)"))} title="Forearms (Brachioradialis / Extensors)" />
                          <circle cx="245" cy="195" r="12" fill="rgba(200, 180, 160, 0.6)" stroke="rgba(200, 180, 160, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Forearms (Brachioradialis / Extensors)"))} title="Forearms (Brachioradialis / Extensors)" />
                          {/* Abs - Center abdomen */}
                          <circle cx="150" cy="200" r="14" fill="rgba(163, 56, 93, 0.6)" stroke="rgba(163, 56, 93, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Rectus Abdominis (Abs)"))} title="Rectus Abdominis (Abs)" />
                          {/* Serratus Anterior / Obliques - Sides of torso */}
                          <circle cx="100" cy="210" r="12" fill="rgba(200, 130, 50, 0.6)" stroke="rgba(200, 130, 50, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Serratus Anterior & External Obliques"))} title="Serratus Anterior & External Obliques" />
                          <circle cx="200" cy="210" r="12" fill="rgba(200, 130, 50, 0.6)" stroke="rgba(200, 130, 50, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Serratus Anterior & External Obliques"))} title="Serratus Anterior & External Obliques" />
                          {/* Quadriceps - Front thigh */}
                          <circle cx="115" cy="290" r="14" fill="rgba(108, 91, 147, 0.6)" stroke="rgba(108, 91, 147, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Rectus Femoris (Quadriceps)"))} title="Rectus Femoris (Quadriceps)" />
                          <circle cx="185" cy="290" r="14" fill="rgba(74, 123, 176, 0.6)" stroke="rgba(74, 123, 176, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Vastus Medialis (Quadriceps)"))} title="Vastus Medialis (Quadriceps)" />
                          {/* Vastus Lateralis - Outer thigh */}
                          <circle cx="100" cy="300" r="12" fill="rgba(90, 140, 200, 0.6)" stroke="rgba(90, 140, 200, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Vastus Lateralis (Quadriceps)"))} title="Vastus Lateralis (Quadriceps)" />
                          <circle cx="200" cy="300" r="12" fill="rgba(90, 140, 200, 0.6)" stroke="rgba(90, 140, 200, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Vastus Lateralis (Quadriceps)"))} title="Vastus Lateralis (Quadriceps)" />
                          {/* Calves - Lower leg */}
                          <circle cx="130" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                          <circle cx="170" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                        </svg>
                      </div>
                      <div className={`anatomy-img-box ${anatomyView === 'back' ? 'active' : ''}`}>
                        <img src={backImg} alt="Anatomy Back" className="anatomy-image" />
                        <svg className="anatomy-overlay" viewBox="0 0 300 400">
                          {/* Trapezius - Upper back/neck */}
                          <circle cx="150" cy="85" r="14" fill="rgba(200, 160, 100, 0.6)" stroke="rgba(200, 160, 100, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Trapezius (Upper Back / Neck)"))} title="Trapezius (Upper Back / Neck)" />
                          {/* Posterior Deltoids - Back shoulders */}
                          <circle cx="85" cy="95" r="12" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Deltoids (Shoulders)"))} title="Deltoids (Shoulders)" />
                          <circle cx="215" cy="95" r="12" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Deltoids (Shoulders)"))} title="Deltoids (Shoulders)" />
                          {/* Triceps - Posterior arm */}
                          <circle cx="55" cy="145" r="12" fill="rgba(160, 180, 200, 0.6)" stroke="rgba(160, 180, 200, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Triceps Brachii"))} title="Triceps Brachii" />
                          <circle cx="245" cy="145" r="12" fill="rgba(160, 180, 200, 0.6)" stroke="rgba(160, 180, 200, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Triceps Brachii"))} title="Triceps Brachii" />
                          {/* Lats - Back middle */}
                          <circle cx="120" cy="165" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Latissimus Dorsi (Lats)"))} title="Latissimus Dorsi (Lats)" />
                          <circle cx="180" cy="165" r="14" fill="rgba(217, 126, 74, 0.6)" stroke="rgba(217, 126, 74, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Latissimus Dorsi (Lats)"))} title="Latissimus Dorsi (Lats)" />
                          {/* Erector Spinae (Lower back) - Center lower back */}
                          <circle cx="150" cy="240" r="14" fill="rgba(163, 56, 93, 0.6)" stroke="rgba(163, 56, 93, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Erector Spinae (Lower Back)"))} title="Erector Spinae (Lower Back)" />
                          {/* Glutes - Buttocks */}
                          <circle cx="125" cy="300" r="14" fill="rgba(108, 91, 147, 0.6)" stroke="rgba(108, 91, 147, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gluteus Maximus & Medius (Glutes)"))} title="Gluteus Maximus & Medius (Glutes)" />
                          <circle cx="175" cy="300" r="14" fill="rgba(108, 91, 147, 0.6)" stroke="rgba(108, 91, 147, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gluteus Maximus & Medius (Glutes)"))} title="Gluteus Maximus & Medius (Glutes)" />
                          {/* Hamstrings - Back thigh */}
                          <circle cx="125" cy="280" r="12" fill="rgba(74, 123, 176, 0.6)" stroke="rgba(74, 123, 176, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Hamstrings (Biceps Femoris)"))} title="Hamstrings (Biceps Femoris)" />
                          <circle cx="175" cy="280" r="12" fill="rgba(74, 123, 176, 0.6)" stroke="rgba(74, 123, 176, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Hamstrings (Biceps Femoris)"))} title="Hamstrings (Biceps Femoris)" />
                          {/* Calves - Back lower leg */}
                          <circle cx="130" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                          <circle cx="170" cy="360" r="12" fill="rgba(127, 184, 71, 0.6)" stroke="rgba(127, 184, 71, 1)" strokeWidth="2" cursor="pointer" onClick={() => setSelectedMuscle(colorMap.find(m => m["muscle name"] === "Gastrocnemius & Soleus (Calves)"))} title="Gastrocnemius & Soleus (Calves)" />
                        </svg>
                      </div>
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
                        <>
                          <div className="exercise-gif-container">
                            {exercises[currentExIndex] && (
                              <img src={exercises[currentExIndex]?.gifUrl} alt={exercises[currentExIndex]?.name} onError={() => handleImageError(currentExIndex)} />
                            )}
                          </div>
                          <div className="exercise-gallery-row">
                            <div className="exercise-gallery">
                              {exercises.map((ex, idx) => (
                                <div
                                  key={idx}
                                  className={`gallery-item ${idx === currentExIndex ? 'active' : ''}`}
                                  onClick={() => setCurrentExIndex(idx)}
                                >
                                  <img src={ex.gifUrl} alt={ex.name} onError={() => handleImageError(idx)} />
                                </div>
                              ))}
                            </div>
                            <button className="gallery-skip" onClick={nextEx} title="Next exercise"><i className="ph ph-caret-circle-right"></i></button>
                          </div>
                        </>
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
        </div>

        <WearableModal isOpen={isWearableModalOpen} onClose={() => setIsWearableModalOpen(false)} onConnected={handleWearableConnected} />

      </main>
  );
}
