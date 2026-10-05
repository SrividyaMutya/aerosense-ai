import React, { useState, useEffect } from 'react';
import { Heart, Plus, Trash2, CheckCircle2, Sparkles, Clock, Save, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function ComfortMemoryPage({ decision, environment }) {
  const [preferences, setPreferences] = useState([]);
  const [activePrefId, setActivePrefId] = useState(null);
  const [loading, setLoading] = useState(true);

  // New preset form
  const [name, setName] = useState('');
  const [targetTemp, setTargetTemp] = useState(26.0);
  const [airflow, setAirflow] = useState('Balanced');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await api.getComfortPreferences();
      setPreferences(data.preferences || []);
      setActivePrefId(data.active_preference_id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await api.saveComfortPreference({
        preset_name: name,
        preferred_temp: parseFloat(targetTemp),
        preferred_airflow: airflow,
      });
      setName('');
      await loadPreferences();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.activateComfortPreference(id);
      await loadPreferences();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeactivate = async () => {
    try {
      await api.deactivateComfortPreference();
      await loadPreferences();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteComfortPreference(id);
      await loadPreferences();
    } catch (e) {
      console.error(e);
    }
  };

  const isAppliedNow = decision?.personalized_applied;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          Comfort Memory & Personalized Profiles (SQLite Persisted)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          AtomQuest 2026 Adaptive Learning • Learns and recalls individual thermal comfort preferences across environmental shifts
        </p>
      </div>

      {/* Live Personalization Status Banner */}
      {isAppliedNow ? (
        <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300">
                Personalized Comfort Preference Active
              </h4>
              <p className="text-xs text-emerald-400/90 mt-0.5">
                Current ambient temperature matches your active preference envelope (±2.5°C). Bioclimatic speed bias is actively engaged.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-700">
            Bias Applied
          </span>
        </div>
      ) : (
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Standard Baseline AI Mode
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Select or save a comfort preference below. When ambient conditions near your target setpoint, personalized biasing activates automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Save New Preference Form */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Save New Comfort Profile
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Persists to local SQLite database <code>aerosense.db</code> for hardware restart recall.
          </p>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Preset Name
              </label>
              <input
                type="text"
                placeholder="e.g., Deep Focus / Work From Home"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#090e18] border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-medium mb-1">
                <span>Preferred Target Temp:</span>
                <span className="font-mono text-cyan-400 font-bold">{targetTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="32.0"
                step="0.5"
                value={targetTemp}
                onChange={(e) => setTargetTemp(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>20°C (Chilled)</span>
                <span>26°C (Balanced)</span>
                <span>32°C (Mild)</span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Airflow Intensity Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Gentle', 'Balanced', 'Crisp'].map((flow) => (
                  <button
                    key={flow}
                    type="button"
                    onClick={() => setAirflow(flow)}
                    className={`py-2 rounded-lg border font-medium transition-colors ${
                      airflow === flow
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                        : 'bg-[#090e18] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {flow}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Activate Profile'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Stored Profiles in SQLite */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Stored Profiles in SQLite ({preferences.length})
            </h3>
            {activePrefId && (
              <button
                onClick={handleDeactivate}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Deactivate Selection
              </button>
            )}
          </div>

          <div className="space-y-3">
            {preferences.map((pref) => {
              const isActive = pref.id === activePrefId;
              return (
                <div
                  key={pref.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{pref.preset_name}</span>
                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1 font-mono">
                      <span>Target: <strong className="text-rose-400">{pref.preferred_temp}°C</strong></span>
                      <span>Airflow: <strong className="text-cyan-300">{pref.preferred_airflow}</strong></span>
                      <span className="text-slate-500 text-[10px]">Saved: {pref.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isActive ? (
                      <button
                        onClick={() => handleActivate(pref.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow"
                      >
                        Activate
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        In Use
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(pref.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
