import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { db } from '../lib/db';
import { UserSettings } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    fontSize: 16,
    language: 'en',
    geminiApiKey: '',
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const savedSettings = await db.getUserSettings();
    setSettings(savedSettings);
    if (savedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  async function handleSettingChange(key: keyof UserSettings, value: any) {
    const newSettings = { ...settings, [key]: value };
    await db.saveUserSettings(newSettings);
    setSettings(newSettings);

    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        <Button onClick={() => navigate('/')}>{t('back')}</Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="darkMode">{t('darkMode')}</Label>
          <Switch
            id="darkMode"
            checked={settings.darkMode}
            onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSize">{t('fontSize')}</Label>
          <Input
            id="fontSize"
            type="number"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
            min={12}
            max={24}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t('language')}</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => handleSettingChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="uk">Українська</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="geminiApiKey">{t('geminiApiKey')}</Label>
          <Input
            id="geminiApiKey"
            type="password"
            value={settings.geminiApiKey || ''}
            onChange={(e) => handleSettingChange('geminiApiKey', e.target.value)}
            placeholder={t('enterApiKey')}
          />
        </div>
      </div>
    </div>
  );
}