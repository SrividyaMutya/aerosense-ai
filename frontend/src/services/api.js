// AeroSense AI – API Client & WebSocket Telemetry Manager

const BASE_URL = '/api';

export const api = {
  // Sensors & Environment
  async getSensors() {
    const res = await fetch(`${BASE_URL}/sensors`);
    return res.json();
  },

  async updateSensors(state) {
    const res = await fetch(`${BASE_URL}/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    return res.json();
  },

  // Fan Status & Manual Control
  async getFanStatus() {
    const res = await fetch(`${BASE_URL}/fan/status`);
    return res.json();
  },

  async controlFan(command) {
    const res = await fetch(`${BASE_URL}/fan/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    return res.json();
  },

  // AI Decision
  async getDecision() {
    const res = await fetch(`${BASE_URL}/ai/decision`);
    return res.json();
  },

  // Energy
  async getEnergy() {
    const res = await fetch(`${BASE_URL}/energy`);
    return res.json();
  },

  // Comfort Memory (SQLite)
  async getComfortPreferences() {
    const res = await fetch(`${BASE_URL}/comfort-memory`);
    return res.json();
  },

  async saveComfortPreference(preset) {
    const res = await fetch(`${BASE_URL}/comfort-memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preset),
    });
    return res.json();
  },

  async deleteComfortPreference(id) {
    const res = await fetch(`${BASE_URL}/comfort-memory/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async activateComfortPreference(id) {
    const res = await fetch(`${BASE_URL}/comfort-memory/activate/${id}`, {
      method: 'POST',
    });
    return res.json();
  },

  async deactivateComfortPreference() {
    const res = await fetch(`${BASE_URL}/comfort-memory/deactivate`, {
      method: 'POST',
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(timespan = '24h') {
    const res = await fetch(`${BASE_URL}/analytics?timespan=${timespan}`);
    return res.json();
  },

  // Scenarios
  async getScenarios() {
    const res = await fetch(`${BASE_URL}/scenarios`);
    return res.json();
  },

  async runScenario(id) {
    const res = await fetch(`${BASE_URL}/scenarios/${id}`, {
      method: 'POST',
    });
    return res.json();
  },

  // Reset
  async resetSimulation() {
    const res = await fetch(`${BASE_URL}/simulation/reset`, {
      method: 'POST',
    });
    return res.json();
  },

  // Hardware Spec
  async getHardwareSpec() {
    const res = await fetch(`${BASE_URL}/hardware/spec`);
    return res.json();
  },
};

/**
 * Creates and manages a WebSocket connection to the backend telemetry stream.
 * Automatically handles reconnection and ping-pongs.
 */
export function connectTelemetryWebSocket(onTelemetry, onStatusChange) {
  let ws = null;
  let isClosedIntentionally = false;
  let reconnectTimer = null;

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In local development, connect directly to backend port 8008 for maximum reliability
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const wsHost = isLocalDev ? `${window.location.hostname}:8008` : window.location.host;
    const wsUrl = `${protocol}//${wsHost}/ws/live`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (onStatusChange) onStatusChange('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry_update' || data.type === 'initial_state') {
            if (onTelemetry) onTelemetry(data);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        if (onStatusChange) onStatusChange('disconnected');
        if (!isClosedIntentionally) {
          reconnectTimer = setTimeout(connect, 1500);
        }
      };

      ws.onerror = () => {
        if (onStatusChange) onStatusChange('error');
        ws.close();
      };
    } catch (e) {
      if (onStatusChange) onStatusChange('error');
      reconnectTimer = setTimeout(connect, 2000);
    }
  }

  connect();

  return () => {
    isClosedIntentionally = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
  };
}
