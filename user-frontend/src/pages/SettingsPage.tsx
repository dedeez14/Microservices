import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Key,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Check,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorRequired: boolean;
  };
  notifications: {
    email: {
      enabled: boolean;
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      fromAddress: string;
    };
    push: {
      enabled: boolean;
    };
  };
  appearance: {
    defaultTheme: 'light' | 'dark' | 'auto';
    allowUserThemeChange: boolean;
    primaryColor: string;
    logoUrl?: string;
  };
}

const defaultSettings: SystemSettings = {
  maintenance: {
    enabled: false,
    message: 'System maintenance in progress. Please check back later.',
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorRequired: false,
  },
  notifications: {
    email: {
      enabled: true,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      fromAddress: '',
    },
    push: {
      enabled: false,
    },
  },
  appearance: {
    defaultTheme: 'light',
    allowUserThemeChange: true,
    primaryColor: '#3b82f6',
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isChanged, setIsChanged] = useState(false);

  // Simulate loading settings
  useEffect(() => {
    // In a real app, you'd fetch settings from an API
    setSettings(defaultSettings);
  }, []);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      setIsChanged(false);
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleSettingsChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SystemSettings],
        [field]: value,
      },
    }));
    setIsChanged(true);
  };

  const handleNestedSettingsChange = (section: string, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SystemSettings],
        [subsection]: {
          ...(prev[section as keyof SystemSettings] as any)[subsection],
          [field]: value,
        },
      },
    }));
    setIsChanged(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setIsChanged(false);
    toast.success('Settings reset to defaults');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences
          </p>
        </div>
        {isChanged && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveSettingsMutation.isPending}
              className="flex items-center gap-2"
            >
              {saveSettingsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default User Role
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Registration
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm">
                        <option value="open">Open Registration</option>
                        <option value="approval">Require Approval</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        System Name
                      </label>
                      <Input defaultValue="User Management System" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Version
                      </label>
                      <Input defaultValue="1.0.0" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Minimum Length
                      </label>
                      <Input
                        type="number"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) => handleNestedSettingsChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password Max Age (days)
                      </label>
                      <Input
                        type="number"
                        value={settings.security.passwordPolicy.maxAge}
                        onChange={(e) => handleNestedSettingsChange('security', 'passwordPolicy', 'maxAge', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                      { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                      { key: 'requireNumbers', label: 'Require Numbers' },
                      { key: 'requireSpecialChars', label: 'Require Special Characters' },
                    ].map((rule) => (
                      <div key={rule.key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{rule.label}</span>
                        <button
                          onClick={() => handleNestedSettingsChange('security', 'passwordPolicy', rule.key, !settings.security.passwordPolicy[rule.key as keyof typeof settings.security.passwordPolicy])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.security.passwordPolicy[rule.key as keyof typeof settings.security.passwordPolicy]
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.security.passwordPolicy[rule.key as keyof typeof settings.security.passwordPolicy]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Session & Login Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Login Attempts
                      </label>
                      <Input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleSettingsChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Two-Factor Authentication</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Force all users to enable 2FA</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('security', 'twoFactorRequired', !settings.security.twoFactorRequired)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.twoFactorRequired ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.twoFactorRequired ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Email Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Send notifications via email</p>
                    </div>
                    <button
                      onClick={() => handleNestedSettingsChange('notifications', 'email', 'enabled', !settings.notifications.email.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.email.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.email.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.notifications.email.enabled && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SMTP Host
                          </label>
                          <Input
                            value={settings.notifications.email.smtpHost}
                            onChange={(e) => handleNestedSettingsChange('notifications', 'email', 'smtpHost', e.target.value)}
                            placeholder="smtp.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            SMTP Port
                          </label>
                          <Input
                            type="number"
                            value={settings.notifications.email.smtpPort}
                            onChange={(e) => handleNestedSettingsChange('notifications', 'email', 'smtpPort', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          From Email Address
                        </label>
                        <Input
                          type="email"
                          value={settings.notifications.email.fromAddress}
                          onChange={(e) => handleNestedSettingsChange('notifications', 'email', 'fromAddress', e.target.value)}
                          placeholder="noreply@example.com"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme & Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Default Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Monitor },
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.value}
                            onClick={() => handleSettingsChange('appearance', 'defaultTheme', theme.value)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                              settings.appearance.defaultTheme === theme.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {theme.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow User Theme Changes</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Let users choose their preferred theme</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('appearance', 'allowUserThemeChange', !settings.appearance.allowUserThemeChange)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.appearance.allowUserThemeChange ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.appearance.allowUserThemeChange ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Maintenance Settings */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Maintenance Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Maintenance Mode</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Temporarily disable access for maintenance</p>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('maintenance', 'enabled', !settings.maintenance.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenance.enabled ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenance.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.maintenance.enabled && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Maintenance Message
                        </label>
                        <textarea
                          value={settings.maintenance.message}
                          onChange={(e) => handleSettingsChange('maintenance', 'message', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {settings.maintenance.enabled && (
                    <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Maintenance Mode Active</span>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Only administrators can access the system while maintenance mode is enabled.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Backup & Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export User Data
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Audit Logs
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Import Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
