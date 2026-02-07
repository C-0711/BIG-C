import { useState } from 'react';
import { useConfig } from '../config/ConfigProvider';

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        {desc && <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function ConfigSettings() {
  const { config, loading, getInstance, getBranding, getDashboard, patchConfig } = useConfig();
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  const instance = getInstance();
  const branding = getBranding();
  const dashboard = getDashboard();

  const updateDashboard = async (key, value) => {
    setSaving(true);
    await patchConfig({
      ui: {
        ...config.ui,
        dashboard: { ...dashboard, [key]: value }
      }
    });
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure your instance preferences
        </p>
      </div>

      <Section title="Instance">
        <SettingRow label="Name" desc="Your instance display name">
          <span className="text-gray-900 dark:text-white font-mono">{instance.name}</span>
        </SettingRow>
        <SettingRow label="Locale" desc="Language and region">
          <span className="text-gray-600 dark:text-gray-400">{instance.locale || 'de-DE'}</span>
        </SettingRow>
      </Section>

      <Section title="Dashboard">
        <SettingRow label="Show KPIs" desc="Display key performance indicators">
          <Toggle 
            checked={dashboard.showKPIs !== false} 
            onChange={(v) => updateDashboard('showKPIs', v)}
          />
        </SettingRow>
        <SettingRow label="Show Quick Actions" desc="Display shortcut buttons">
          <Toggle 
            checked={dashboard.showQuickActions !== false} 
            onChange={(v) => updateDashboard('showQuickActions', v)}
          />
        </SettingRow>
        <SettingRow label="Show Recent Activity" desc="Display activity feed">
          <Toggle 
            checked={dashboard.showRecentActivity !== false} 
            onChange={(v) => updateDashboard('showRecentActivity', v)}
          />
        </SettingRow>
      </Section>

      <Section title="Theme">
        <SettingRow label="Primary Color">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10"
              style={{ background: branding.primaryColor || '#22c55e' }}
            />
            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {branding.primaryColor || '#22c55e'}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Accent Color">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10"
              style={{ background: branding.accentColor || '#3b82f6' }}
            />
            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {branding.accentColor || '#3b82f6'}
            </span>
          </div>
        </SettingRow>
      </Section>

      <Section title="Advanced">
        <SettingRow label="Admin Dashboard" desc="Configure agents, workflows, and more">
          <a 
            href="/admin"
            className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            Open Admin →
          </a>
        </SettingRow>
        <SettingRow label="Config File" desc="Direct config file location">
          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">~/.0711/config.json</span>
        </SettingRow>
      </Section>

      {saving && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
}
