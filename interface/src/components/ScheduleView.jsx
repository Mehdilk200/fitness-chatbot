import React, { useState, useEffect } from 'react';
import { scheduleApi, chatApi } from '../services/api';
import colorMap from '../../../backend/data/color_map.json';
import './ScheduleView.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = Array.from({ length: 8 }, (_, i) => `${(i * 2 + 6).toString().padStart(2, '0')}:00`);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ScheduleView() {
  const [schedule, setSchedule] = useState([]);
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    muscle_group: colorMap[0]["muscle name"],
    day: 'Mon',
    start_time: '09:00',
    end_time: '11:00',
    calories: 0,
    image_url: '',
    notes: '',
    color: colorMap[0].hex
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const data = await scheduleApi.getSchedule();
      setSchedule(data);
    } catch (err) {
      console.error("Failed to fetch schedule", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (day = 'Mon', time = '09:00', item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        muscle_group: item.muscle_group,
        day: item.day,
        start_time: item.start_time,
        end_time: item.end_time,
        calories: item.calories || 0,
        image_url: item.image_url || '',
        notes: item.notes || '',
        color: item.color
      });
    } else {
      setEditingItem(null);
      setFormData({
        muscle_group: colorMap[0]["muscle name"],
        day: day,
        start_time: time,
        end_time: calculateEndTime(time),
        calories: 0,
        image_url: '',
        notes: '',
        color: colorMap[0].hex
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const result = await chatApi.uploadFile(file);
      if (result.url) {
        setFormData({ ...formData, image_url: result.url });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const calculateEndTime = (startTime) => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + 2).toString().padStart(2, '0');
    return `${endH}:${m.toString().padStart(2, '0')}`;
  };

  const filteredSchedule = filterMuscle === 'All' 
    ? schedule 
    : schedule.filter(item => item.muscle_group === filterMuscle);

  const getItemsForSlot = (day, time) => {
    return filteredSchedule.filter(item => item.day === day && item.start_time === time);
  };

  // Mini Calendar Logic
  const renderMiniCalendar = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-header">
          <span>{MONTHS[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
          <div className="mini-nav">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><i className="ph ph-caret-left"></i></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><i className="ph ph-caret-right"></i></button>
          </div>
        </div>
        <div className="mini-calendar-grid">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} className="mini-day-name">{d}</div>)}
          {blanks.map(b => <div key={`b-${b}`} className="mini-day blank"></div>)}
          {days.map(d => (
            <div key={d} className={`mini-day ${d === new Date().getDate() ? 'today' : ''}`}>{d}</div>
          ))}
        </div>
      </div>
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await scheduleApi.updateScheduleItem(editingItem._id, formData);
      } else {
        await scheduleApi.addScheduleItem(formData);
      }
      setShowModal(false);
      fetchSchedule();
    } catch (err) {
      alert("Failed to save item");
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await scheduleApi.deleteScheduleItem(editingItem._id);
        setShowModal(false);
        fetchSchedule();
      } catch (err) {
        alert("Failed to delete item");
      }
    }
  };


  return (
    <div className="schedule-layout">
      <div className="schedule-main">
        <div className="schedule-header">
          <div className="schedule-title-area">
            <h1>Schedule Task</h1>
            <div className="month-selector">
              <span className="current-month-label">{MONTHS[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
              <div className="month-nav-btns">
                <button className="nav-btn"><i className="ph ph-caret-left"></i></button>
                <button className="nav-btn active"><i className="ph ph-caret-right"></i></button>
              </div>
            </div>
          </div>
          
          <div className="header-controls">
            <div className="filter-group">
              <select 
                className="filter-select"
                value={filterMuscle} 
                onChange={(e) => setFilterMuscle(e.target.value)}
              >
                <option value="All">All Muscles</option>
                {colorMap.map(m => (
                  <option key={m["muscle name"]} value={m["muscle name"]}>{m["muscle name"].split('(')[0]}</option>
                ))}
              </select>
            </div>
            <div className="view-toggle">
              <button className="toggle-btn active">Week</button>
              <button className="toggle-btn">Month</button>
            </div>
          </div>
        </div>

        <div className="schedule-grid-wrapper">
          <div className="schedule-grid">
            <div className="grid-corner">Time</div>
            {DAYS.map(day => (
              <div key={day} className="grid-day-header">{day}</div>
            ))}

            {TIMES.map(time => (
              <React.Fragment key={time}>
                <div className="grid-time-label">{time}</div>
                {DAYS.map(day => {
                  const items = getItemsForSlot(day, time);
                  return (
                    <div 
                      key={`${day}-${time}`} 
                      className="grid-cell"
                      onClick={() => handleOpenModal(day, time)}
                    >
                      {items.map(item => (
                        <div 
                          key={item._id} 
                          className="workout-card-mini" 
                          style={{ borderLeft: `4px solid ${item.color}`, background: `${item.color}15` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(day, time, item);
                          }}
                        >
                          <div className="card-top">
                            <div className="card-title">{item.muscle_group.split('(')[1]?.replace(')', '') || item.muscle_group}</div>
                            {item.calories > 0 && <div className="card-cal"><i className="ph ph-fire"></i> {item.calories}</div>}
                          </div>
                          <div className="card-time">{item.start_time} - {item.end_time}</div>
                          {item.image_url && (
                            <div className="card-img">
                              <img src={item.image_url} alt="workout" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <aside className="schedule-sidebar">
        {renderMiniCalendar()}
        
        <button className="btn-add-new-task" onClick={() => handleOpenModal()}>
          <span className="plus-icon">+</span> Add New Task
        </button>

        <div className="sidebar-stats">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Your Best Month</span>
              <span className="stat-value">March</span>
              <span className="stat-sub">200 Hrs Worked</span>
            </div>
            <button className="stat-more"><i className="ph ph-dots-three-vertical"></i></button>
          </div>
          <div className="stat-card active">
            <div className="stat-info">
              <span className="stat-label">Active Project</span>
              <span className="stat-value">March</span>
              <span className="stat-sub">6 Active Now</span>
            </div>
            <button className="stat-more"><i className="ph ph-dots-three-vertical"></i></button>
          </div>
        </div>

        <div className="reminders-section">
          <div className="reminders-header">
            <h3>Reminders</h3>
            <div className="bell-icon"><i className="ph ph-bell"></i></div>
          </div>
          <div className="reminder-list">
            <div className="reminder-item">
              <div className="rem-icon yellow"><i className="ph ph-arrows-clockwise"></i></div>
              <div className="rem-content">
                <span className="rem-text">Your subscription expires</span>
                <span className="rem-action">Renew Now</span>
              </div>
              <span className="rem-time">6:30 PM</span>
            </div>
            <div className="reminder-item">
              <div className="rem-icon blue"><i className="ph ph-envelope"></i></div>
              <div className="rem-content">
                <span className="rem-text">34 New unread Message</span>
                <span className="rem-action">View All</span>
              </div>
              <span className="rem-time">5:30 PM</span>
            </div>
          </div>
        </div>
      </aside>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Workout' : 'Add Workout'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="ph ph-x"></i></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Muscle Group</label>
                <select 
                  value={formData.muscle_group} 
                  onChange={(e) => {
                    const selected = colorMap.find(m => m["muscle name"] === e.target.value);
                    setFormData({...formData, muscle_group: e.target.value, color: selected.hex});
                  }}
                >
                  {colorMap.map(m => (
                    <option key={m["muscle name"]} value={m["muscle name"]}>{m["muscle name"]}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Day</label>
                  <select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Calories</label>
                  <input type="number" placeholder="kcal" value={formData.calories} onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Workout Image</label>
                <div className="image-upload-box">
                  {formData.image_url ? (
                    <div className="preview-container">
                      <img src={formData.image_url} alt="preview" />
                      <button type="button" className="remove-img" onClick={() => setFormData({...formData, image_url: ''})}><i className="ph ph-x"></i></button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input type="file" onChange={handleImageUpload} hidden />
                      <i className="ph ph-image-plus"></i>
                      <span>{uploading ? 'Uploading...' : 'Add Image'}</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea 
                  placeholder="e.g. 4 sets of 12 reps" 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-footer">
                {editingItem && (
                  <button type="button" className="btn-delete" onClick={handleDelete}>Delete</button>
                )}
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
