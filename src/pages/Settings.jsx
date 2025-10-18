import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCog,
  FaArrowLeft,
  FaSun,
  FaMoon,
  FaBell,
  FaShieldAlt,
  FaUser,
  FaPalette,
  FaCheckCircle,
  FaKey,
  FaLink,
  FaCopy,
  FaTrash,
  FaPlus,
  FaDownload,
  FaUpload,
  FaLaptop,
  FaDatabase,
  FaServer,
  FaHeartbeat,
  FaChartLine,
  FaExclamationTriangle,
  FaUserShield,
  FaNetworkWired,
  FaUserTag,
  FaEnvelopeOpenText,
} from 'react-icons/fa';

// Advanced Admin Settings page (frontend-only, persists to localStorage under "nc_settings").
// If you want server-backed settings, I can wire API endpoints later.
const Settings = () => {
  const navigate = useNavigate();
  const fileImportRef = useRef(null);
  const ipInputRef = useRef(null);
  const impersonateRef = useRef(null);

  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nc_settings') || '{}');
      return {
        // General/Appearance
        theme: saved.theme || 'light', // 'light' | 'dark' | 'system'
        primaryColor: saved.primaryColor || 'indigo',
        gradient: saved.gradient || 'indigo',
        glassEffect: saved.glassEffect ?? false,
        density: saved.density || 'comfortable', // comfortable | compact
        radius: saved.radius || 'md', // sm | md | lg
        displayName: saved.displayName || '',
        language: saved.language || 'en',
        timezone: saved.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        avatar: saved.avatar || '',

        // Notifications
        emailNotifications: saved.emailNotifications ?? true,
        smsNotifications: saved.smsNotifications ?? false,
        pushNotifications: saved.pushNotifications ?? true,
        notificationTemplates: saved.notificationTemplates || {
          welcome: { subject: 'Welcome to NeuroCare', body: 'Hello {{name}}, welcome aboard!' },
          passwordReset: { subject: 'Reset your password', body: 'Use this link to reset your password: {{link}}' },
          alert: { subject: 'System Alert', body: 'An important event occurred: {{details}}' },
        },

        // Security
        twoFactorAuth: saved.twoFactorAuth ?? false,
        enforce2FA: saved.enforce2FA ?? false,
        passwordPolicy: saved.passwordPolicy || { minLength: 8, requireNumber: true, requireUpper: true, requireSymbol: false },
        sessionTimeout: saved.sessionTimeout || 30, // minutes
        ipAllowlist: saved.ipAllowlist || [],

        // Privacy
        telemetry: saved.telemetry ?? false,
        cookieConsent: saved.cookieConsent ?? true,

        // System
        maintenanceMode: saved.maintenanceMode ?? false,
        featureFlags: saved.featureFlags || { aiInsights: true, newUI: true, betaTools: false },
        appMeta: saved.appMeta || { name: 'NeuroCare AI', version: '1.0.0', baseUrl: 'http://localhost:5173' },

        // Integrations
        apiKeys: saved.apiKeys || [], // [{id,key,createdAt,label}]
        webhooks: saved.webhooks || [], // [{id,url,secret,active}]
        oauthProviders: saved.oauthProviders || [ // mock config
          { id: 'google', name: 'Google', clientId: '', enabled: false },
          { id: 'github', name: 'GitHub', clientId: '', enabled: false },
        ],
        rateLimits: saved.rateLimits || { rpm: 180, burst: 60 },

        // Sessions (mock)
        sessions: saved.sessions || [
          { id: 'sess-1', device: 'Windows 11 • Edge', location: 'Local', lastActive: new Date().toISOString(), current: true },
          { id: 'sess-2', device: 'iPhone 14 • Safari', location: 'Delhi', lastActive: new Date(Date.now() - 86400000).toISOString(), current: false },
        ],

        // Users & Roles (policies are frontend-only examples)
        rolePolicies: saved.rolePolicies || {
          admin: { viewReports: true, editUsers: true, accessAI: true },
          doctor: { viewReports: true, editUsers: false, accessAI: true },
          patient: { viewReports: true, editUsers: false, accessAI: false },
        },
        impersonation: saved.impersonation || { active: false, userId: '' },

        // Data
        dataRetentionDays: saved.dataRetentionDays || 365,
        anonymization: saved.anonymization || { lastRunAt: null, recordsAffected: 0 },

        // Audit & Monitoring
        auditLogs: saved.auditLogs || [
          { id: 'log1', time: new Date().toISOString(), actor: 'system', action: 'startup', target: '-' },
        ],
        healthChecks: saved.healthChecks || [
          { id: 'api', name: 'API Server', status: 'healthy', latency: 42 },
          { id: 'db', name: 'Database', status: 'healthy', latency: 20 },
          { id: 'storage', name: 'Storage', status: 'healthy', latency: 35 },
        ],
        usage: saved.usage || { dailyActiveUsers: 42, reportsGenerated: 12, apiCallsToday: 1200 },

        // Shortcuts
        shortcuts: saved.shortcuts || {
          openDashboard: 'Ctrl+Shift+D',
          quickSearch: 'Ctrl+K',
          newReport: 'Ctrl+N',
        },
      };
    } catch {
      return {
        theme: 'light', primaryColor: 'indigo', gradient: 'indigo', glassEffect: false, density: 'comfortable', radius: 'md',
        displayName: '', language: 'en', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', avatar: '',
        emailNotifications: true, smsNotifications: false, pushNotifications: true,
        notificationTemplates: {
          welcome: { subject: 'Welcome to NeuroCare', body: 'Hello {{name}}, welcome aboard!' },
          passwordReset: { subject: 'Reset your password', body: 'Use this link to reset your password: {{link}}' },
          alert: { subject: 'System Alert', body: 'An important event occurred: {{details}}' },
        },
        twoFactorAuth: false, enforce2FA: false, passwordPolicy: { minLength: 8, requireNumber: true, requireUpper: true, requireSymbol: false }, sessionTimeout: 30, ipAllowlist: [],
        telemetry: false, cookieConsent: true,
        maintenanceMode: false, featureFlags: { aiInsights: true, newUI: true, betaTools: false }, appMeta: { name: 'NeuroCare AI', version: '1.0.0', baseUrl: 'http://localhost:5173' },
        apiKeys: [], webhooks: [], oauthProviders: [ { id: 'google', name: 'Google', clientId: '', enabled: false }, { id: 'github', name: 'GitHub', clientId: '', enabled: false } ], rateLimits: { rpm: 180, burst: 60 },
        sessions: [ { id: 'sess-1', device: 'Windows 11 • Edge', location: 'Local', lastActive: new Date().toISOString(), current: true } ],
        rolePolicies: { admin: { viewReports: true, editUsers: true, accessAI: true }, doctor: { viewReports: true, editUsers: false, accessAI: true }, patient: { viewReports: true, editUsers: false, accessAI: false } },
        impersonation: { active: false, userId: '' },
        dataRetentionDays: 365, anonymization: { lastRunAt: null, recordsAffected: 0 },
        auditLogs: [ { id: 'log1', time: new Date().toISOString(), actor: 'system', action: 'startup', target: '-' } ],
        healthChecks: [ { id: 'api', name: 'API Server', status: 'healthy', latency: 42 }, { id: 'db', name: 'Database', status: 'healthy', latency: 20 }, { id: 'storage', name: 'Storage', status: 'healthy', latency: 35 } ],
        usage: { dailyActiveUsers: 42, reportsGenerated: 12, apiCallsToday: 1200 },
        shortcuts: { openDashboard: 'Ctrl+Shift+D', quickSearch: 'Ctrl+K', newReport: 'Ctrl+N' },
      };
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState('system');
  const [showSaved, setShowSaved] = useState(false);
  const [copyOk, setCopyOk] = useState('');
  const [shortcutCapture, setShortcutCapture] = useState(null); // key of shortcut being edited
  const [templatePreview, setTemplatePreview] = useState({ type: 'welcome', to: 'admin@example.com' });

  // Persist
  useEffect(() => { localStorage.setItem('nc_settings', JSON.stringify(settings)); }, [settings]);

  // Toast timers
  useEffect(() => { if (showSaved) { const t = setTimeout(() => setShowSaved(false), 1500); return () => clearTimeout(t); } }, [showSaved]);
  useEffect(() => { if (copyOk) { const t = setTimeout(() => setCopyOk(''), 1200); return () => clearTimeout(t); } }, [copyOk]);

  // System dark preference
  const prefersDark = useMemo(() => { if (typeof window === 'undefined') return false; return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }, []);
  const isDarkMode = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);

  // Accent palette
  const colorClasses = {
    indigo: { bg: 'bg-indigo-600', ring: 'ring-indigo-500', text: 'text-indigo-600', hover: 'hover:bg-indigo-700', soft: 'bg-indigo-50' },
    blue: { bg: 'bg-blue-600', ring: 'ring-blue-500', text: 'text-blue-600', hover: 'hover:bg-blue-700', soft: 'bg-blue-50' },
    purple: { bg: 'bg-purple-600', ring: 'ring-purple-500', text: 'text-purple-600', hover: 'hover:bg-purple-700', soft: 'bg-purple-50' },
    emerald: { bg: 'bg-emerald-600', ring: 'ring-emerald-500', text: 'text-emerald-600', hover: 'hover:bg-emerald-700', soft: 'bg-emerald-50' },
    rose: { bg: 'bg-rose-600', ring: 'ring-rose-500', text: 'text-rose-600', hover: 'hover:bg-rose-700', soft: 'bg-rose-50' },
    amber: { bg: 'bg-amber-600', ring: 'ring-amber-500', text: 'text-amber-600', hover: 'hover:bg-amber-700', soft: 'bg-amber-50' },
  };
  const gradientClasses = {
    indigo: 'from-indigo-500 via-indigo-600 to-indigo-700',
    blue: 'from-blue-500 via-blue-600 to-blue-700',
    purple: 'from-purple-500 via-purple-600 to-purple-700',
    emerald: 'from-emerald-500 via-emerald-600 to-emerald-700',
    rose: 'from-rose-500 via-rose-600 to-rose-700',
    amber: 'from-amber-500 via-amber-600 to-amber-700',
  };
  const accent = colorClasses[settings.primaryColor] || colorClasses.indigo;

  const radiusClass = settings.radius === 'sm' ? 'rounded-lg' : settings.radius === 'lg' ? 'rounded-3xl' : 'rounded-2xl';
  const glassClass = settings.glassEffect ? (isDarkMode ? 'bg-white/5 backdrop-blur border-gray-700' : 'bg-white/60 backdrop-blur border-gray-200') : (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200');

  const setField = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
  const updateNested = (path, value) => {
    setSettings(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] = { ...obj[keys[i]] };
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Util
  const copy = async (text) => { try { await navigator.clipboard.writeText(text); setCopyOk('Copied'); } catch {} };
  const saveNow = () => setShowSaved(true);
  const resetDefaults = () => { localStorage.removeItem('nc_settings'); window.location.reload(); };

  // Avatar upload
  const onAvatarChange = (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setField('avatar', String(reader.result)); reader.readAsDataURL(file); };

  // API keys
  function cryptoRandomId() { const arr = new Uint32Array(4); if (window.crypto?.getRandomValues) window.crypto.getRandomValues(arr); return Array.from(arr, n => n.toString(16)).join(''); }
  const generateApiKey = () => { const rand = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); return 'NC_' + rand.toUpperCase().slice(0, 28); };
  const addApiKey = () => { const key = generateApiKey(); const item = { id: cryptoRandomId(), key, createdAt: new Date().toISOString(), label: 'New key' }; setField('apiKeys', [...settings.apiKeys, item]); setCopyOk('API key created'); };
  const revokeApiKey = (id) => setField('apiKeys', settings.apiKeys.filter(k => k.id !== id));

  // Webhooks
  const addWebhook = () => { const item = { id: cryptoRandomId(), url: 'https://example.com/webhook', secret: cryptoRandomId().slice(0, 10), active: true }; setField('webhooks', [...settings.webhooks, item]); };
  const removeWebhook = (id) => setField('webhooks', settings.webhooks.filter(w => w.id !== id));
  const toggleWebhook = (id) => setField('webhooks', settings.webhooks.map(w => w.id === id ? { ...w, active: !w.active } : w));

  // Sessions
  const revokeSession = (id) => setField('sessions', settings.sessions.filter(s => !(s.id === id && !s.current)));

  // IP allowlist
  const addIp = () => { const val = ipInputRef.current?.value?.trim(); if (!val) return; if (!settings.ipAllowlist.includes(val)) setField('ipAllowlist', [...settings.ipAllowlist, val]); if (ipInputRef.current) ipInputRef.current.value = ''; };
  const removeIp = (ip) => setField('ipAllowlist', settings.ipAllowlist.filter(x => x !== ip));

  // Shortcuts capture
  const handleShortcutKeyDown = (e, keyName) => { e.preventDefault(); e.stopPropagation(); const parts = []; if (e.ctrlKey) parts.push('Ctrl'); if (e.shiftKey) parts.push('Shift'); if (e.altKey) parts.push('Alt'); const key = e.key.length === 1 ? e.key.toUpperCase() : e.key; if (!['Control', 'Shift', 'Alt'].includes(key)) parts.push(key); const combo = parts.join('+'); setField('shortcuts', { ...settings.shortcuts, [keyName]: combo || settings.shortcuts[keyName] }); setShortcutCapture(null); };

  // Templates
  const testSendTemplate = () => { setCopyOk(`Test sent to ${templatePreview.to}`); };

  // OAuth providers
  const toggleProvider = (id) => setField('oauthProviders', settings.oauthProviders.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  const setProviderClientId = (id, clientId) => setField('oauthProviders', settings.oauthProviders.map(p => p.id === id ? { ...p, clientId } : p));

  // Data
  const runAnonymization = () => { const affected = Math.floor(Math.random() * 50) + 10; setField('anonymization', { lastRunAt: new Date().toISOString(), recordsAffected: affected }); setCopyOk(`Anonymized ${affected} records`); };

  // Audit & Monitoring
  const appendAudit = (action, target = '-') => setField('auditLogs', [{ id: cryptoRandomId(), time: new Date().toISOString(), actor: 'admin', action, target }, ...settings.auditLogs].slice(0, 100));
  const runHealthChecks = () => { const next = settings.healthChecks.map(h => ({ ...h, status: Math.random() < 0.9 ? 'healthy' : 'degraded', latency: Math.floor(Math.random() * 80) + 10 })); setField('healthChecks', next); setCopyOk('Health checks updated'); };

  // Components
  const SectionCard = ({ title, icon, children }) => (
    <div className={`${glassClass} ${radiusClass} border p-6 shadow-sm hover:shadow transition-shadow`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${accent.soft}`}>{icon}</div>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );

  const NavItem = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === id ? `${accent.bg} text-white` : (isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')}`}>{label}</button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`} style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className={`mx-auto max-w-7xl px-4 pt-6 pb-4`}>
        <button onClick={() => navigate('/admin-dashboard')} className={`inline-flex items-center gap-2 text-sm ${accent.text} hover:underline`}><FaArrowLeft /> Back to Admin Dashboard</button>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accent.bg} text-white shadow-lg`}><FaCog /></div>
            <div>
              <h1 className="text-2xl font-bold">Admin Settings</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Control appearance, security, integrations, data, and more</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetDefaults} className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} text-sm ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>Reset</button>
            <button onClick={saveNow} className={`px-4 py-2 rounded-lg text-white text-sm ${accent.bg} ${accent.hover}`}>Save changes</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 pb-16 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2 lg:sticky lg:top-4 h-max">
          <NavItem id="system" label="System" />
          <NavItem id="general" label="General" />
          <NavItem id="appearance" label="Appearance" />
          <NavItem id="notifications" label="Notifications" />
          <NavItem id="security" label="Security" />
          <NavItem id="usersRoles" label="Users & Roles" />
          <NavItem id="integrations" label="Integrations" />
          <NavItem id="data" label="Data" />
          <NavItem id="audit" label="Audit & Monitoring" />
          <NavItem id="shortcuts" label="Shortcuts" />
          <NavItem id="backup" label="Backup & Import" />
          <NavItem id="privacy" label="Privacy" />
          <NavItem id="about" label="About" />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'system' && (
            <>
              <SectionCard title="Maintenance & Flags" icon={<FaServer className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-medium">Maintenance mode</div>
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Temporarily hide the app for end users</div>
                      </div>
                      <Toggle checked={settings.maintenanceMode} onChange={(v) => { setField('maintenanceMode', v); appendAudit(v ? 'maintenance_on' : 'maintenance_off'); }} />
                    </div>
                    <div className="mt-4 space-y-2">
                      {Object.entries(settings.featureFlags).map(([flag, val]) => (
                        <div key={flag} className="flex items-center justify-between py-1">
                          <span className="text-sm capitalize">{flag.replace(/([A-Z])/g, ' $1')}</span>
                          <Toggle checked={val} onChange={(v) => updateNested(`featureFlags.${flag}`, v)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">App name</label>
                        <input value={settings.appMeta.name} onChange={(e) => updateNested('appMeta.name', e.target.value)} className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Version</label>
                        <input value={settings.appMeta.version} onChange={(e) => updateNested('appMeta.version', e.target.value)} className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Base URL</label>
                        <input value={settings.appMeta.baseUrl} onChange={(e) => updateNested('appMeta.baseUrl', e.target.value)} className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'general' && (
            <>
              <SectionCard title="Profile" icon={<FaUser className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div>
                    <div className={`w-24 h-24 ${radiusClass} overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} bg-gray-200`}>
                      {settings.avatar ? (<img alt="avatar" src={settings.avatar} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-gray-500">No Avatar</div>)}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label className={`px-3 py-2 text-sm ${accent.bg} text-white ${accent.hover} ${radiusClass} cursor-pointer`}>
                        Upload
                        <input hidden type="file" accept="image/*" onChange={onAvatarChange} />
                      </label>
                      {settings.avatar && (<button onClick={() => setField('avatar', '')} className={`px-3 py-2 text-sm ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} hover:bg-red-50 text-red-600`}><FaTrash /></button>)}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Display name</label>
                      <input type="text" className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} ${accent.ring}`} placeholder="e.g., Dr. Emily Rodriguez" value={settings.displayName} onChange={(e) => setField('displayName', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Language</label>
                        <select className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} ${accent.ring}`} value={settings.language} onChange={(e) => setField('language', e.target.value)}>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Timezone</label>
                        <input type="text" className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} ${accent.ring}`} value={settings.timezone} onChange={(e) => setField('timezone', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Density & Corners" icon={<FaLaptop className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Interface density</label>
                    <div className="mt-3 flex items-center gap-2">
                      {['comfortable','compact'].map(opt => (
                        <button key={opt} onClick={() => setField('density', opt)} className={`px-3 py-2 text-sm capitalize border ${radiusClass} ${settings.density === opt ? `${accent.bg} text-white border-transparent` : (isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Corner radius</label>
                    <div className="mt-3 flex items-center gap-2">
                      {['sm','md','lg'].map(opt => (
                        <button key={opt} onClick={() => setField('radius', opt)} className={`px-3 py-2 text-sm uppercase border ${radiusClass} ${settings.radius === opt ? `${accent.bg} text-white border-transparent` : (isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}`}>{opt}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'appearance' && (
            <SectionCard title="Theme & Colors" icon={<FaPalette className={`${accent.text}`} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <div className="mt-3 flex items-center gap-2">
                    {['light', 'dark', 'system'].map(opt => (
                      <button key={opt} onClick={() => setField('theme', opt)} className={`px-3 py-2 text-sm capitalize border ${radiusClass} ${settings.theme === opt ? `${accent.bg} text-white border-transparent` : (isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Primary color</label>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {Object.keys(colorClasses).map(color => (
                      <button key={color} onClick={() => setField('primaryColor', color)} className={`relative w-10 h-10 ${radiusClass} border ${settings.primaryColor === color ? 'ring-2 ring-offset-2 ' + (colorClasses[color]?.ring || 'ring-indigo-500') : ''} ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} aria-label={color} title={color}>
                        <span className={`absolute inset-1 ${radiusClass} ${colorClasses[color]?.bg || 'bg-indigo-600'}`}></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Gradient style</label>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {Object.keys(gradientClasses).map(g => (
                      <button key={g} onClick={() => setField('gradient', g)} className={`px-3 py-2 text-sm capitalize border ${radiusClass} ${settings.gradient === g ? `${accent.bg} text-white border-transparent` : (isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100')}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Glass effect</label>
                  <div className="mt-3"><label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.glassEffect} onChange={e => setField('glassEffect', e.target.checked)} /> Enable subtle translucency</label></div>
                </div>
              </div>
              <div className={`mt-6 p-6 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-br ${gradientClasses[settings.gradient]} text-white shadow-inner`}>
                <div className="text-sm opacity-90">Live preview</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 ${radiusClass} bg-white/10`}>Button: <span className={`inline-block ml-2 px-3 py-1 ${radiusClass} bg-white/20`}>Primary</span></div>
                  <div className={`p-4 ${radiusClass} bg-white/10`}>Card: clean glass UI</div>
                  <div className={`p-4 ${radiusClass} bg-white/10`}>Badge: <span className={`ml-2 px-2 py-0.5 ${radiusClass} bg-white/20`}>New</span></div>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === 'notifications' && (
            <>
              <SectionCard title="Delivery Channels" icon={<FaBell className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Toggle checked={settings.emailNotifications} onChange={(v) => setField('emailNotifications', v)} label="Email notifications" />
                  <Toggle checked={settings.smsNotifications} onChange={(v) => setField('smsNotifications', v)} label="SMS notifications" />
                  <Toggle checked={settings.pushNotifications} onChange={(v) => setField('pushNotifications', v)} label="Push notifications" />
                </div>
              </SectionCard>

              <SectionCard title="Templates & Test" icon={<FaEnvelopeOpenText className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Template</label>
                    <select className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} value={templatePreview.type} onChange={(e) => setTemplatePreview(prev => ({ ...prev, type: e.target.value }))}>
                      {Object.keys(settings.notificationTemplates).map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>
                    <label className="block text-sm font-medium">Subject</label>
                    <input value={settings.notificationTemplates[templatePreview.type].subject} onChange={(e) => updateNested(`notificationTemplates.${templatePreview.type}.subject`, e.target.value)} className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                    <label className="block text-sm font-medium">Body</label>
                    <textarea value={settings.notificationTemplates[templatePreview.type].body} onChange={(e) => updateNested(`notificationTemplates.${templatePreview.type}.body`, e.target.value)} rows={5} className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`}/>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Send test to</label>
                    <input value={templatePreview.to} onChange={(e) => setTemplatePreview(prev => ({ ...prev, to: e.target.value }))} className={`w-full ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                    <button onClick={testSendTemplate} className={`inline-flex items-center gap-2 px-4 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}>
                      Send test
                    </button>
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Use placeholders like {{name}}, {{link}}, {{details}}.</div>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <SectionCard title="Authentication" icon={<FaShieldAlt className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Toggle checked={settings.twoFactorAuth} onChange={(v) => setField('twoFactorAuth', v)} label="Allow 2FA" />
                  <Toggle checked={settings.enforce2FA} onChange={(v) => setField('enforce2FA', v)} label="Enforce 2FA for admins" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Session timeout (minutes)</span>
                    <input type="number" min={5} className={`w-28 ${radiusClass} px-2 py-1 border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} value={settings.sessionTimeout} onChange={(e) => setField('sessionTimeout', Number(e.target.value) || 5)} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Password policy" icon={<FaUserShield className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Min length</span>
                    <input type="number" min={6} className={`w-28 ${radiusClass} px-2 py-1 border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} value={settings.passwordPolicy.minLength} onChange={(e) => updateNested('passwordPolicy.minLength', Number(e.target.value) || 6)} />
                  </div>
                  <Toggle checked={settings.passwordPolicy.requireNumber} onChange={(v) => updateNested('passwordPolicy.requireNumber', v)} label="Require number" />
                  <Toggle checked={settings.passwordPolicy.requireUpper} onChange={(v) => updateNested('passwordPolicy.requireUpper', v)} label="Require uppercase" />
                  <Toggle checked={settings.passwordPolicy.requireSymbol} onChange={(v) => updateNested('passwordPolicy.requireSymbol', v)} label="Require symbol" />
                </div>
              </SectionCard>

              <SectionCard title="IP allowlist" icon={<FaNetworkWired className={`${accent.text}`} />}>
                <div className="flex items-center gap-2 mb-3">
                  <input ref={ipInputRef} placeholder="e.g., 192.168.1.10" className={`flex-1 ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                  <button onClick={addIp} className={`px-3 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}><FaPlus /> Add</button>
                </div>
                <div className="space-y-2">
                  {settings.ipAllowlist.length === 0 && (<div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No IPs added.</div>)}
                  {settings.ipAllowlist.map(ip => (
                    <div key={ip} className={`flex items-center justify-between px-3 py-2 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="text-sm font-mono">{ip}</div>
                      <button onClick={() => removeIp(ip)} className={`px-2 py-1 text-xs ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} text-red-600`}><FaTrash /></button>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Sessions" icon={<FaLaptop className={`${accent.text}`} />}>
                <div className="space-y-3">
                  {settings.sessions.map(sess => (
                    <div key={sess.id} className={`flex items-center justify-between px-3 py-3 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div>
                        <div className="font-medium text-sm">{sess.device}</div>
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Last active: {new Date(sess.lastActive).toLocaleString()} • {sess.location}</div>
                      </div>
                      {sess.current ? (<span className="text-xs px-2 py-1 bg-emerald-600 text-white rounded">Current</span>) : (<button onClick={() => revokeSession(sess.id)} className={`text-xs px-3 py-1 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} hover:bg-red-50 text-red-600`}>Revoke</button>)}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'usersRoles' && (
            <>
              <SectionCard title="Role policies" icon={<FaUserTag className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(settings.rolePolicies).map(([role, perms]) => (
                    <div key={role} className={`p-4 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="font-semibold mb-2 capitalize">{role}</div>
                      {Object.entries(perms).map(([perm, val]) => (
                        <div key={perm} className="flex items-center justify-between py-1">
                          <span className="text-sm">{perm}</span>
                          <Toggle checked={val} onChange={(v) => setField('rolePolicies', { ...settings.rolePolicies, [role]: { ...settings.rolePolicies[role], [perm]: v } })} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Impersonation" icon={<FaUser className={`${accent.text}`} />}>
                <div className="flex items-center gap-2">
                  <input ref={impersonateRef} placeholder="User ID or email" className={`flex-1 ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                  {!settings.impersonation.active ? (
                    <button onClick={() => { const id = impersonateRef.current?.value?.trim(); if (!id) return; setField('impersonation', { active: true, userId: id }); appendAudit('impersonate_start', id); }} className={`px-3 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}>Start</button>
                  ) : (
                    <button onClick={() => { appendAudit('impersonate_stop', settings.impersonation.userId); setField('impersonation', { active: false, userId: '' }); }} className={`px-3 py-2 text-sm ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>Stop</button>
                  )}
                </div>
                {settings.impersonation.active && (
                  <div className={`mt-3 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Impersonating: {settings.impersonation.userId}</div>
                )}
              </SectionCard>
            </>
          )}

          {activeTab === 'integrations' && (
            <>
              <SectionCard title="API Keys" icon={<FaKey className={`${accent.text}`} />}>
                <div className="mb-3 flex items-center gap-2">
                  <button onClick={addApiKey} className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}><FaPlus /> New key</button>
                </div>
                <div className="space-y-3">
                  {settings.apiKeys.length === 0 && (<div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No API keys yet.</div>)}
                  {settings.apiKeys.map(item => (
                    <div key={item.id} className={`flex items-center justify-between px-3 py-3 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div>
                        <div className="text-sm font-mono">{item.key.replace(/.(?=.{4})/g, '•')}</div>
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{item.label || 'Key'} • {new Date(item.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copy(item.key)} className={`px-2 py-1 text-xs ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}><FaCopy /></button>
                        <button onClick={() => revokeApiKey(item.id)} className={`px-2 py-1 text-xs ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} text-red-600`}><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="OAuth Providers" icon={<FaLink className={`${accent.text}`} />}>
                <div className="space-y-3">
                  {settings.oauthProviders.map(p => (
                    <div key={p.id} className={`grid grid-cols-1 md:grid-cols-4 gap-3 items-center ${radiusClass} p-3 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="font-medium">{p.name}</div>
                      <input placeholder="Client ID" value={p.clientId} onChange={(e) => setProviderClientId(p.id, e.target.value)} className={`md:col-span-2 ${radiusClass} px-3 py-2 border focus:outline-none focus:ring-2 ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} />
                      <label className="justify-self-end text-sm inline-flex items-center gap-2"><input type="checkbox" checked={p.enabled} onChange={() => toggleProvider(p.id)} /> Enabled</label>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Webhooks & Rate Limits" icon={<FaLink className={`${accent.text}`} />}>
                <div className="mb-3"><button onClick={addWebhook} className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}><FaPlus /> Add webhook</button></div>
                <div className="space-y-3">
                  {settings.webhooks.length === 0 && (<div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No webhooks configured.</div>)}
                  {settings.webhooks.map(h => (
                    <div key={h.id} className={`px-3 py-3 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium truncate max-w-[50ch]">{h.url}</div>
                          <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Secret: {h.secret}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs inline-flex items-center gap-1"><input type="checkbox" checked={h.active} onChange={() => toggleWebhook(h.id)} /> Active</label>
                          <button onClick={() => removeWebhook(h.id)} className={`px-2 py-1 text-xs ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} text-red-600`}><FaTrash /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center justify-between py-2"><span className="text-sm font-medium">Requests per minute</span><input type="number" min={30} className={`w-28 ${radiusClass} px-2 py-1 border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} value={settings.rateLimits.rpm} onChange={(e) => updateNested('rateLimits.rpm', Number(e.target.value) || 30)} /></div>
                  <div className="flex items-center justify-between py-2"><span className="text-sm font-medium">Burst</span><input type="number" min={10} className={`w-28 ${radiusClass} px-2 py-1 border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} value={settings.rateLimits.burst} onChange={(e) => updateNested('rateLimits.burst', Number(e.target.value) || 10)} /></div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'data' && (
            <>
              <SectionCard title="Retention" icon={<FaDatabase className={`${accent.text}`} />}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Data retention (days)</span>
                  <input type="number" min={30} className={`w-28 ${radiusClass} px-2 py-1 border text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} ${accent.ring}`} value={settings.dataRetentionDays} onChange={(e) => setField('dataRetentionDays', Number(e.target.value) || 30)} />
                </div>
              </SectionCard>

              <SectionCard title="Anonymization" icon={<FaExclamationTriangle className={`${accent.text}`} />}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Run anonymization</div>
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Replace PII with synthetic tokens</div>
                    {settings.anonymization.lastRunAt && (<div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last: {new Date(settings.anonymization.lastRunAt).toLocaleString()} • {settings.anonymization.recordsAffected} records</div>)}
                  </div>
                  <button onClick={runAnonymization} className={`px-4 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}>Run</button>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'audit' && (
            <>
              <SectionCard title="Health checks" icon={<FaHeartbeat className={`${accent.text}`} />}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Services status</div>
                  <button onClick={runHealthChecks} className={`px-3 py-2 text-sm ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>Run checks</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {settings.healthChecks.map(h => (
                    <div key={h.id} className={`p-3 ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="font-medium text-sm">{h.name}</div>
                      <div className="text-xs mt-1">Status: <span className={h.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}>{h.status}</span></div>
                      <div className="text-xs">Latency: {h.latency} ms</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Usage metrics" icon={<FaChartLine className={`${accent.text}`} />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Metric title="Daily Active Users" value={settings.usage.dailyActiveUsers} />
                  <Metric title="Reports Generated" value={settings.usage.reportsGenerated} />
                  <Metric title="API Calls Today" value={settings.usage.apiCallsToday} />
                </div>
              </SectionCard>

              <SectionCard title="Audit log" icon={<FaDatabase className={`${accent.text}`} />}>
                <div className={`max-h-64 overflow-auto ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <table className="w-full text-sm">
                    <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <tr>
                        <th className="text-left px-3 py-2">Time</th>
                        <th className="text-left px-3 py-2">Actor</th>
                        <th className="text-left px-3 py-2">Action</th>
                        <th className="text-left px-3 py-2">Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.auditLogs.map(log => (
                        <tr key={log.id} className={`${isDarkMode ? 'border-gray-800' : 'border-gray-100'} border-t`}>
                          <td className="px-3 py-2 whitespace-nowrap">{new Date(log.time).toLocaleString()}</td>
                          <td className="px-3 py-2">{log.actor}</td>
                          <td className="px-3 py-2">{log.action}</td>
                          <td className="px-3 py-2">{log.target}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === 'shortcuts' && (
            <SectionCard title="Keyboard Shortcuts" icon={<FaLaptop className={`${accent.text}`} />}>
              <div className="space-y-4">
                {Object.entries(settings.shortcuts).map(([keyName, combo]) => (
                  <div key={keyName} className="grid grid-cols-[1fr,220px] items-center gap-3">
                    <div className="text-sm font-medium capitalize">{keyName.replace(/([A-Z])/g, ' $1')}</div>
                    <input onFocus={() => setShortcutCapture(keyName)} onKeyDown={(e) => handleShortcutKeyDown(e, keyName)} value={shortcutCapture === keyName ? 'Press keys…' : combo} readOnly className={`px-3 py-2 text-sm font-mono ${radiusClass} border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 ${accent.ring}`} />
                  </div>
                ))}
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Click a field and press the desired key combination.</p>
              </div>
            </SectionCard>
          )}

          {activeTab === 'backup' && (
            <SectionCard title="Backup & Import" icon={<FaDownload className={`${accent.text}`} />}>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => exportSettings(settings)} className={`inline-flex items-center gap-2 px-3 py-2 text-sm text-white ${accent.bg} ${accent.hover} ${radiusClass}`}><FaDownload /> Export settings</button>
                <button onClick={() => fileImportRef.current?.click()} className={`inline-flex items-center gap-2 px-3 py-2 text-sm ${radiusClass} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}><FaUpload /> Import settings</button>
                <input ref={fileImportRef} hidden type="file" accept="application/json" onChange={(e) => importSettings(e, setSettings, setShowSaved)} />
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mt-2`}>Export a JSON backup or import previously saved settings.</p>
            </SectionCard>
          )}

          {activeTab === 'privacy' && (
            <SectionCard title="Privacy & Data" icon={<FaShieldAlt className={`${accent.text}`} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Toggle checked={settings.telemetry} onChange={(v) => setField('telemetry', v)} label="Allow anonymous telemetry" />
                <Toggle checked={settings.cookieConsent} onChange={(v) => setField('cookieConsent', v)} label="Cookie consent" />
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mt-2`}>We do not collect personal data. Telemetry helps improve performance and stability.</p>
            </SectionCard>
          )}

          {activeTab === 'about' && (
            <SectionCard title="About" icon={<FaCog className={`${accent.text}`} />}>
              <div className="space-y-2 text-sm">
                <div>NeuroCare AI — Admin Settings v3.0</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fully configurable system controls. Switch to server-backed mode anytime.</div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Toasts */}
      {showSaved && (
        <div className={`fixed bottom-6 right-6 inline-flex items-center gap-2 px-4 py-3 ${radiusClass} shadow-lg ${isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}>
          <FaCheckCircle className="text-emerald-500" />
          <span className="text-sm font-medium">Settings saved</span>
        </div>
      )}
      {copyOk && (
        <div className={`fixed bottom-6 right-6 inline-flex items-center gap-2 px-4 py-3 ${radiusClass} shadow-lg ${isDarkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`} style={{ transform: 'translateY(-56px)' }}>
          <FaCheckCircle className="text-emerald-500" />
          <span className="text-sm font-medium">{copyOk}</span>
        </div>
      )}
    </div>
  );
};

// Reusable small components and helpers (hoisted)
function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-2">
      {label ? <span className="text-sm font-medium">{label}</span> : null}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`${checked ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-green-400`}
        aria-pressed={checked}
      >
        <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
      </button>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className={`p-4 rounded-2xl border border-gray-200`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function exportSettings(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nc_settings_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importSettings(e, setSettings, setShowSaved) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      setSettings(prev => ({ ...prev, ...data }));
      setShowSaved(true);
    } catch {
      // ignore parse errors
    }
  };
  reader.readAsText(file);
}

export default Settings;