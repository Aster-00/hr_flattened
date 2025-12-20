'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Form, FormField } from './Form';

interface BackupSettingsData {
  backupFrequency: string;
  backupLocation: string;
  retentionPeriod: number;
  updatedAt?: string;
}

interface BackupSettingsFormProps {
  initialData?: BackupSettingsData;
  onSave: (data: BackupSettingsData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const backupFrequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const backupLocationOptions = [
  { label: 'Local', value: 'local' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'External Drive', value: 'external' },
];

export default function BackupSettingsForm({
  initialData,
  onSave,
  onCancel,
  isSaving,
}: BackupSettingsFormProps) {
  const [formData, setFormData] = useState<BackupSettingsData>({
    backupFrequency: initialData?.backupFrequency || 'daily',
    backupLocation: initialData?.backupLocation || 'local',
    retentionPeriod: initialData?.retentionPeriod || 30,
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    backupFrequency?: string;
    backupLocation?: string;
    retentionPeriod?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        backupFrequency: initialData.backupFrequency || 'daily',
        backupLocation: initialData.backupLocation || 'local',
        retentionPeriod: initialData.retentionPeriod || 30,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: { backupFrequency?: string; backupLocation?: string; retentionPeriod?: string } = {};

    if (!formData.backupFrequency) {
      errors.backupFrequency = 'Backup frequency is required';
    }

    if (!formData.backupLocation) {
      errors.backupLocation = 'Backup location is required';
    }

    if (!formData.retentionPeriod || formData.retentionPeriod < 0) {
      errors.retentionPeriod = 'Retention period must be a positive number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'retentionPeriod' ? parseInt(value) || 0 : value,
    }));

    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof fieldErrors];
        return newErrors;
      });
    }

    setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save backup settings');
    }
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      onCancel={onCancel}
      submitLabel="Save"
      cancelLabel="Cancel"
    >
      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {initialData && (
        <div className="p-4 bg-[var(--primary-50)] border border-[var(--primary-200)] rounded-xl mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-[var(--primary-800)] mb-3 flex items-center gap-2">
            <span className="w-2 h-6 bg-[var(--primary-600)] rounded-full"></span>
            Current Backup Settings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-[var(--primary-100)]">
              <span className="text-[var(--primary-700)] font-medium">Backup Frequency:</span>
              <span className="font-bold text-[var(--primary-900)] capitalize bg-white px-2 py-0.5 rounded border border-[var(--primary-200)]">
                {initialData.backupFrequency || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--primary-100)]">
              <span className="text-[var(--primary-700)] font-medium">Backup Location:</span>
              <span className="font-bold text-[var(--primary-900)] capitalize bg-white px-2 py-0.5 rounded border border-[var(--primary-200)]">
                {initialData.backupLocation || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--primary-100)]">
              <span className="text-[var(--primary-700)] font-medium">Retention Period:</span>
              <span className="font-bold text-[var(--primary-900)] bg-white px-2 py-0.5 rounded border border-[var(--primary-200)]">
                {initialData.retentionPeriod ? `${initialData.retentionPeriod} days` : 'Not set'}
              </span>
            </div>
            {initialData.updatedAt && (
              <div className="flex justify-between pt-2">
                <span className="text-[var(--primary-600)] text-xs italic">Last Updated:</span>
                <span className="text-[var(--primary-800)] text-xs font-semibold">
                  {formatDateTime(initialData.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="backupFrequency" className="form-label">
          Backup Frequency
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="backupFrequency"
          name="backupFrequency"
          value={formData.backupFrequency}
          onChange={handleInputChange}
          required
          className={`form-input ${fieldErrors.backupFrequency ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
          aria-invalid={!!fieldErrors.backupFrequency}
          aria-describedby={fieldErrors.backupFrequency ? 'backupFrequency-error' : undefined}
        >
          {backupFrequencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1 italic">
          How often backups should be performed
        </p>
        {fieldErrors.backupFrequency && (
          <p id="backupFrequency-error" className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.backupFrequency}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="backupLocation" className="form-label">
          Backup Location
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="backupLocation"
          name="backupLocation"
          value={formData.backupLocation}
          onChange={handleInputChange}
          required
          className={`form-input ${fieldErrors.backupLocation ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
          aria-invalid={!!fieldErrors.backupLocation}
          aria-describedby={fieldErrors.backupLocation ? 'backupLocation-error' : undefined}
        >
          {backupLocationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1 italic">
          Where backups should be stored
        </p>
        {fieldErrors.backupLocation && (
          <p id="backupLocation-error" className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.backupLocation}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="retentionPeriod" className="form-label">
          Retention Period (Days)
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="retentionPeriod"
          type="number"
          name="retentionPeriod"
          value={formData.retentionPeriod}
          onChange={handleInputChange}
          required
          min="0"
          className={`form-input ${fieldErrors.retentionPeriod ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
          aria-invalid={!!fieldErrors.retentionPeriod}
          aria-describedby={fieldErrors.retentionPeriod ? 'retentionPeriod-error' : undefined}
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1 italic">
          How long to keep backups before deletion (in days)
        </p>
        {fieldErrors.retentionPeriod && (
          <p id="retentionPeriod-error" className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.retentionPeriod}</p>
        )}
      </div>
    </Form>
  );
}

