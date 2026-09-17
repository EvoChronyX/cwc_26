const API_BASE = 'http://localhost:8000/api';
export const WS_URL = 'ws://localhost:8000/ws';

export const getAuthToken = () => {
  return localStorage.getItem('cwc_auth_token') || sessionStorage.getItem('cwc_auth_token') || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('cwc_auth_token', token);
  } else {
    clearAuthToken();
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('cwc_auth_token');
  sessionStorage.removeItem('cwc_auth_token');
  localStorage.removeItem('cwc_user_info');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('cwc_user_info');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('cwc_user_info', JSON.stringify(user));
  } else {
    localStorage.removeItem('cwc_user_info');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

export const api = {
  auth: {
    playerRegisterOrLogin: (teamName, p1Handle, p2Handle, avatarId, password) =>
      request('/auth/player/register-or-login', {
        method: 'POST',
        body: JSON.stringify({
          team_name: teamName,
          p1_handle: p1Handle || '',
          p2_handle: p2Handle || '',
          avatar_id: avatarId || 'avatar-1',
          password: password,
        }),
      }),

    adminLogin: (gmId, password) =>
      request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          gm_id: gmId,
          password: password,
        }),
      }),

    getProfile: () => request('/auth/me'),
  },

  teams: {
    getAll: () => request('/teams'),
    getById: (teamId) => request(`/teams/${teamId}`),
  },

  buzzer: {
    getQueue: () => request('/buzzer/queue'),
    buzz: (clientTimestamp) =>
      request('/buzzer/buzz', {
        method: 'POST',
        body: JSON.stringify({
          client_timestamp: clientTimestamp || Date.now() / 1000,
        }),
      }),
    arm: () => request('/buzzer/arm', { method: 'POST' }),
    lock: () => request('/buzzer/lock', { method: 'POST' }),
    reset: () => request('/buzzer/reset', { method: 'POST' }),
    advance: () => request('/buzzer/advance', { method: 'POST' }),
  },

  scores: {
    adjust: (teamId, delta, reason) =>
      request('/scores/adjust', {
        method: 'POST',
        body: JSON.stringify({
          team_id: teamId,
          delta: delta,
          reason: reason || 'Admin Score Adjustment',
        }),
      }),

    grantFloor: (teamId, delta = 50) =>
      request('/scores/floor-grant', {
        method: 'POST',
        body: JSON.stringify({
          team_id: teamId,
          delta: delta,
        }),
      }),
  },

  sabotages: {
    getCatalog: () => request('/sabotages'),
    deploy: (sabotageSlug, targetTeamId) =>
      request('/sabotages/deploy', {
        method: 'POST',
        body: JSON.stringify({
          sabotage_slug: sabotageSlug,
          target_team_id: targetTeamId,
        }),
      }),
    neutralize: (targetTeamId, sabotageName = null) =>
      request('/sabotages/neutralize', {
        method: 'POST',
        body: JSON.stringify({
          target_team_id: targetTeamId,
          sabotage_name: sabotageName,
        }),
      }),
  },

  audit: {
    getLogs: (category = 'ALL', limit = 100) =>
      request(`/audit/logs?category=${category}&limit=${limit}`),
    clear: () => request('/audit/clear', { method: 'POST' }),
    getExportUrl: () => `${API_BASE}/audit/export-csv`,
  },
};
