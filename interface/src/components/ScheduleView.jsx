import React, { useState, useEffect } from 'react';
import { scheduleApi, chatApi } from '../services/api';
import colorMap from '../../../backend/data/color_map.json';
import './ScheduleView.css';
import { toast } from './Toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = Array.from({ length: 9 }, (_, i) => `${(i * 2 + 6).toString().padStart(2, '0')}:00`);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ScheduleView() {
  const [schedule, setSchedule] = useState([]);
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('Week');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
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

  const handleCellClick = (day, time, items) => {
    if (items && items.length > 0) {
      openViewModal(items[0]);
    } else {
      handleOpenModal(day, time);
    }
  };

  const openViewModal = (item) => {
    setViewItem(item);
    setShowDropdown(false);
    setShowViewModal(true);
  };

  const handleViewUpdate = () => {
    const item = viewItem;
    if (!item || !item.id) {
      console.error("handleViewUpdate: missing item or id", item);
      toast('Error: task data missing', 'error');
      return;
    }
    setShowViewModal(false);
    setViewItem(null);
    setShowDropdown(false);
    handleOpenModal(item.day, item.start_time, item);
  };

  const handleViewDelete = async () => {
    if (!viewItem || !viewItem.id) {
      console.error("handleViewDelete: missing item or id", viewItem);
      toast('Error: task data missing', 'error');
      return;
    }
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await scheduleApi.deleteScheduleItem(viewItem.id);
        setShowViewModal(false);
        setViewItem(null);
        setShowDropdown(false);
        toast('Workout deleted', 'success');
        fetchSchedule();
      } catch (err) {
        toast('Failed to delete item', 'error');
      }
    }
  };

  const handleShare = async () => {
    const text = `Workout: ${viewItem.muscle_group} on ${viewItem.day} at ${viewItem.start_time}`;
    try {
      await navigator.clipboard.writeText(text);
      toast('Workout copied to clipboard', 'success');
    } catch {
      toast('Failed to copy', 'error');
    }
    setShowDropdown(false);
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
    const today = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-header">
          <span>{MONTHS[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
          <div className="mini-nav">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><i className="ph ph-caret-left"></i></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><i className="ph ph-caret-right"></i></button>
          </div>
        </div>
        <div className="mini-calendar-grid">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={`wd-${i}`} className="mini-day-name">{d}</div>)}
          {blanks.map(b => <div key={`b-${b}`} className="mini-day blank"></div>)}
          {days.map(d => {
            const isToday = d === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
            return (
              <div key={d} className={`mini-day ${isToday ? 'today' : ''}`}>{d}</div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        if (!editingItem.id) {
          toast('Error: task ID missing - try refreshing', 'error');
          return;
        }
        await scheduleApi.updateScheduleItem(editingItem.id, formData);
      } else {
        await scheduleApi.addScheduleItem(formData);
      }
      setShowModal(false);
      toast('Workout saved successfully', 'success');
      fetchSchedule();
    } catch (err) {
      toast('Failed to save item', 'error');
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (!editingItem.id) {
      toast('Error: task ID missing - try refreshing', 'error');
      return;
    }
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        await scheduleApi.deleteScheduleItem(editingItem.id);
        setShowModal(false);
        toast('Workout deleted', 'success');
        fetchSchedule();
      } catch (err) {
        toast('Failed to delete item', 'error');
      }
    }
  };


  return (
    <div className="schedule-layout">
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Schedule Task</h1>
          <div className="schedule-header-controls">
            <div className="month-selector">
              <span className="current-month-label">{MONTHS[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
              <div className="month-nav-btns">
                <button className="nav-btn nav-btn-sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><i className="ph ph-caret-left"></i></button>
                <button className="nav-btn nav-btn-sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><i className="ph ph-caret-right"></i></button>
              </div>
            </div>
            <div className="right-controls">
              <div className="filter-group">
              <div className="custom-select" tabIndex={0} onBlur={() => setTimeout(() => setShowFilterDropdown(false), 150)}>
                <button 
                  className="filter-select-trigger" 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  {filterMuscle !== 'All' && (
                    <span 
                      className="filter-color-dot" 
                      style={{ background: colorMap.find(m => m["muscle name"] === filterMuscle)?.hex }}
                    ></span>
                  )}
                  <span>{filterMuscle === 'All' ? 'All Muscles' : filterMuscle.split('(')[0].trim()}</span>
                  <i className="ph ph-caret-down"></i>
                </button>
                {showFilterDropdown && (
                  <div className="custom-select-dropdown">
                    <button 
                      className={`custom-option ${filterMuscle === 'All' ? 'selected' : ''}`}
                      onClick={() => { setFilterMuscle('All'); setShowFilterDropdown(false); }}
                    >
                      <span className="filter-color-dot" style={{ background: 'transparent', border: '1px solid #ccc' }}></span>
                      <span>All Muscles</span>
                    </button>
                    {colorMap.map(m => (
                      <button 
                        key={m["muscle name"]}
                        className={`custom-option ${filterMuscle === m["muscle name"] ? 'selected' : ''}`}
                        onClick={() => { setFilterMuscle(m["muscle name"]); setShowFilterDropdown(false); }}
                      >
                        <span className="filter-color-dot" style={{ background: m.hex }}></span>
                        <span>{m["muscle name"].split('(')[0].trim()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'Week' ? 'active' : ''}`}
                  onClick={() => setViewMode('Week')}
                >Week</button>
                <button 
                  className={`toggle-btn ${viewMode === 'Month' ? 'active' : ''}`}
                  onClick={() => setViewMode('Month')}
                >Month</button>
              </div>
            </div>
          </div>
        </div>

        <div className="schedule-grid-wrapper">
          <div className="mobile-day-bar">
            <button className="mobile-day-arrow" onClick={() => setMobileDayIndex(prev => Math.max(0, prev - 1))} disabled={mobileDayIndex === 0}>
              <i className="ph ph-caret-left"></i>
            </button>
            <span className="mobile-day-label">{DAYS[mobileDayIndex]}</span>
            <button className="mobile-day-arrow" onClick={() => setMobileDayIndex(prev => Math.min(DAYS.length - 1, prev + 1))} disabled={mobileDayIndex === DAYS.length - 1}>
              <i className="ph ph-caret-right"></i>
            </button>
          </div>
          <div className="schedule-grid" data-mobile-day={DAYS[mobileDayIndex]}>
            <div className="grid-corner">Time</div>
            {DAYS.map(day => (
              <div key={day} className="grid-day-header" data-day={day}>{day}</div>
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
                      data-day={day}
                      onClick={() => handleCellClick(day, time, items)}
                    >
                      {items.map(item => (
                        <div 
                          key={item.id} 
                          className="workout-card-mini" 
                          style={{ borderLeft: `4px solid ${item.color}`, background: `${item.color}15` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewModal(item);
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
                <div className="form-group-header">
                  <div className="field-icon-badge muscle"><i className="ph ph-dumbbell"></i></div>
                  <label>Muscle Group</label>
                </div>
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
                  <div className="form-group-header">
                    <div className="field-icon-badge day"><i className="ph ph-calendar"></i></div>
                    <label>Day</label>
                  </div>
                  <select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <div className="form-group-header">
                    <div className="field-icon-badge calories"><i className="ph ph-fire"></i></div>
                    <label>Calories</label>
                  </div>
                  <input type="number" placeholder="kcal" value={formData.calories} onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <div className="form-group-header">
                    <div className="field-icon-badge time"><i className="ph ph-clock"></i></div>
                    <label>Start Time</label>
                  </div>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                </div>
                <div className="form-group">
                  <div className="form-group-header">
                    <div className="field-icon-badge time"><i className="ph ph-clock"></i></div>
                    <label>End Time</label>
                  </div>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-group-header">
                  <div className="field-icon-badge image"><i className="ph ph-camera"></i></div>
                  <label>Workout Image</label>
                </div>
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
                <div className="form-group-header">
                  <div className="field-icon-badge notes"><i className="ph ph-note-pencil"></i></div>
                  <label>Notes (Optional)</label>
                </div>
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

      {showViewModal && viewItem && (
        <div className="modal-overlay" onClick={() => { setShowViewModal(false); setShowDropdown(false); }}>
          <div className="view-modal-content" onClick={e => e.stopPropagation()}>
            <div className="view-modal-header">
              <h2>{viewItem.muscle_group.split('(')[1]?.replace(')', '') || viewItem.muscle_group}</h2>
              <button className="modal-close" onClick={() => { setShowViewModal(false); setShowDropdown(false); }}><i className="ph ph-x"></i></button>
            </div>

            <div className="three-dot-menu">
              <button className="three-dot-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <i className="ph ph-dots-three-vertical"></i>
              </button>
              {showDropdown && (
                <div className="three-dot-dropdown">
                  <button className="dropdown-item" onClick={handleViewUpdate}>
                    <i className="ph ph-pencil"></i> Update
                  </button>
                  <button className="dropdown-item" onClick={handleShare}>
                    <i className="ph ph-share"></i> Share
                  </button>
                  <button className="dropdown-item danger" onClick={handleViewDelete}>
                    <i className="ph ph-trash"></i> Delete
                  </button>
                </div>
              )}
            </div>

            <div className="view-modal-body">
              <div className="view-detail-row">
                <span className="view-detail-label">Muscle Group</span>
                <span className="view-detail-value">{viewItem.muscle_group}</span>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div className="view-detail-row">
                  <span className="view-detail-label">Day</span>
                  <span className="view-detail-value">{viewItem.day}</span>
                </div>
                <div className="view-detail-row">
                  <span className="view-detail-label">Time</span>
                  <span className="view-detail-value">{viewItem.start_time} - {viewItem.end_time}</span>
                </div>
                {viewItem.calories > 0 && (
                  <div className="view-detail-row">
                    <span className="view-detail-label">Calories</span>
                    <span className="view-detail-value">{viewItem.calories} kcal</span>
                  </div>
                )}
              </div>

              {viewItem.image_url && (
                <div className="view-detail-row">
                  <span className="view-detail-label">Workout Image</span>
                  <div className="view-image-container">
                    <img src={viewItem.image_url} alt="workout" />
                  </div>
                </div>
              )}

              {viewItem.notes && (
                <div className="view-detail-row">
                  <span className="view-detail-label">Notes</span>
                  <span className="view-detail-value notes-text">{viewItem.notes}</span>
                </div>
              )}
            </div>

            <div className="view-modal-footer">
              <button className="btn-secondary-outline" onClick={() => { setShowViewModal(false); setShowDropdown(false); }}>Close</button>
              <button className="btn-primary" onClick={handleViewUpdate}>Edit Workout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
