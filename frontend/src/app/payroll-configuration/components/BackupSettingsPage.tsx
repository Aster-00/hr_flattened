'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import BackupSettingsForm from './BackupSettingsForm';

interface BackupSettings {
  _id?: string;
  backupFrequency?: string;
  backupLocation?: string;
  retentionPeriod?: number;
  updatedAt?: string;
}

interface BackupSettingsFormData {
  backupFrequency: string;
  backupLocation: string;
  retentionPeriod: number;
  updatedAt?: string;
}

export default function BackupSettings() {
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiClient.get('/payroll-configuration/company-settings');
      if (data) {
        setSettings({
          _id: data._id,
          backupFrequency: data.backupFrequency || '',
          backupLocation: data.backupLocation || '',
          retentionPeriod: data.retentionPeriod || 30,
          updatedAt: data.updatedAt,
        });
      }
    } catch (err: any) {
      console.error('Error fetching backup settings:', err);
      const errorMessage = err.message || '';
      const is404 = errorMessage.includes('404') || errorMessage.includes('API Error: 404');
      const isHtmlResponse = errorMessage.includes('HTML instead of JSON') || errorMessage.includes('API endpoint not found');

      if (!is404 && !isHtmlResponse) {
        setError('Failed to load settings');
      } else {
        setError('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: BackupSettingsFormData) => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Get existing settings first to preserve other fields (payDate, timeZone, currency)
      const existingData = await apiClient.get('/payroll-configuration/company-settings').catch(() => null);

      if (!existingData || !existingData.payDate || !existingData.timeZone) {
        setError('Company settings must be configured first. Please set up company settings before configuring backup settings.');
        setIsSaving(false);
        return;
      }

      const payload = {
        payDate: existingData.payDate ? new Date(existingData.payDate) : new Date(),
        timeZone: existingData.timeZone,
        currency: existingData.currency || 'EGP',
        backupFrequency: formData.backupFrequency,
        backupLocation: formData.backupLocation,
        retentionPeriod: formData.retentionPeriod,
      };

      await apiClient.post('/payroll-configuration/company-settings', payload);
      setSuccess('Backup settings saved successfully!');
      await fetchSettings();
    } catch (err: any) {
      console.error('Error saving backup settings:', err);
      let errorMessage = err.message || 'Failed to save backup settings';

      if (errorMessage.includes('API Error: 400')) {
        errorMessage = errorMessage.replace('API Error: 400', 'Validation Error:');
      } else if (errorMessage.includes('API Error: 500')) {
        errorMessage = 'Server error, please try again';
      } else if (errorMessage.includes('API endpoint not found')) {
        errorMessage = 'Backend server is not running or API endpoint is incorrect. Please check your backend connection.';
      }

      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    fetchSettings();
  };

  const getInitialData = (): BackupSettingsFormData | undefined => {
    if (!settings) return undefined;
    return {
      backupFrequency: settings.backupFrequency || 'daily',
      backupLocation: settings.backupLocation || 'local',
      retentionPeriod: settings.retentionPeriod || 30,
      updatedAt: settings.updatedAt,
    };
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Backup Settings</h1>
          <p className="text-[var(--text-secondary)]">Configure backup frequency, location, and retention period</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-600)]"></div>
          </div>
        ) : (
          <div className="card">
            {error && (
              <div className="alert alert-error mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                {success}
              </div>
            )}

            <BackupSettingsForm
              initialData={getInitialData()}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
}

