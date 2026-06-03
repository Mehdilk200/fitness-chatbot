export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = new Error(res.statusText || 'API Error');
    error.status = res.status;
    try {
      const data = await res.json();
      error.message = data.detail || error.message;
    } catch (e) {}
    throw error;
  }
  return res.json();
};

export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  register: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};

export const profileApi = {
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  updateProfile: async (data) => {
    const res = await fetch(`${BASE_URL}/profile/update`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};

export const chatApi = {
  sendMessage: async (message, sessionId = null) => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    return handleResponse(res);
  },
  uploadFile: async (file) => {
    const data = new FormData();
    data.append('file', file);
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/chat/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: data,
    });
    return handleResponse(res);
  }
};

export const exerciseApi = {
  searchExercises: async (query) => {
    const res = await fetch(`https://oss.exercisedb.dev/api/v1/exercises/search?search=${encodeURIComponent(query)}&threshold=0.5`);
    return handleResponse(res);
  },
  getExercisesByMuscle: async (muscle) => {
    const res = await fetch(`https://oss.exercisedb.dev/api/v1/exercises/muscles?targetMuscles=${encodeURIComponent(muscle)}&limit=12`);
    return handleResponse(res);
  },
  getMuscles: async () => {
    // Corrected endpoint from docs: /api/v1/muscles for listing names
    const res = await fetch(`https://oss.exercisedb.dev/api/v1/muscles`);
    return handleResponse(res);
  }
};

export const scheduleApi = {
  getSchedule: async () => {
    const res = await fetch(`${BASE_URL}/schedule`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  addScheduleItem: async (data) => {
    const res = await fetch(`${BASE_URL}/schedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateScheduleItem: async (id, data) => {
    const res = await fetch(`${BASE_URL}/schedule/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteScheduleItem: async (id) => {
    const res = await fetch(`${BASE_URL}/schedule/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};
