'use client';

import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { Form, FormField } from './Form';
import { Modal } from './Modal';

interface CompanySettingsData {
  payDate: string;
  timeZone: string;
  currency: string;
  updatedAt?: string;
}

interface CompanySettingsFormProps {
  initialData?: CompanySettingsData;
  onSave: (data: CompanySettingsData) => Promise<void>;
  onCancel: () => void;
}

const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tz.getTime() - utc.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(offset));
    const minutes = Math.abs((offset % 1) * 60);
    return `UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}`;
  } catch {
    return '';
  }
};

const timezoneGroups = [
  {
    label: 'Africa',
    timezones: [
      { value: 'Africa/Cairo', label: 'Africa/Cairo' },
      { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg' },
    ],
  },
  {
    label: 'Europe',
    timezones: [
      { value: 'Europe/London', label: 'Europe/London' },
      { value: 'Europe/Paris', label: 'Europe/Paris' },
    ],
  },
  {
    label: 'America',
    timezones: [
      { value: 'America/New_York', label: 'America/New_York' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
    ],
  },
  {
    label: 'Asia',
    timezones: [
      { value: 'Asia/Dubai', label: 'Asia/Dubai' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
    ],
  },
  {
    label: 'UTC',
    timezones: [{ value: 'UTC', label: 'UTC' }],
  },
];

const currencyOptions = [
  { label: 'EGP', value: 'EGP' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'AED', value: 'AED' },
];

export default function CompanySettingsForm({
  initialData,
  onSave,
  onCancel,
}: CompanySettingsFormProps) {
  const [formData, setFormData] = useState<CompanySettingsData>({
    payDate: initialData?.payDate || '',
    timeZone: initialData?.timeZone || '',
    currency: initialData?.currency || 'EGP',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    payDate?: string;
    timeZone?: string;
    currency?: string;
  }>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const previousValuesRef = useRef<{
    timeZone?: string;
    currency?: string;
  }>({
    timeZone: initialData?.timeZone,
    currency: initialData?.currency,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        payDate: initialData.payDate || '',
        timeZone: initialData.timeZone || '',
        currency: initialData.currency || 'EGP',
      });
      previousValuesRef.current = {
        timeZone: initialData.timeZone,
        currency: initialData.currency,
      };
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: { payDate?: string; timeZone?: string; currency?: string } = {};

    if (!formData.payDate) {
      errors.payDate = 'Pay date is required';
    }

    if (!formData.timeZone) {
      errors.timeZone = 'Timezone is required';
    }

    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof fieldErrors];
        return newErrors;
      });
    }

    setError('');
    setSuccess(false);
  };

  const checkForConfirmation = (): boolean => {
    const timezoneChanged =
      !!previousValuesRef.current.timeZone &&
      formData.timeZone !== previousValuesRef.current.timeZone;
    const currencyChanged =
      !!previousValuesRef.current.currency &&
      formData.currency !== previousValuesRef.current.currency;

    return timezoneChanged || currencyChanged;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if confirmation is needed
    if (checkForConfirmation()) {
      setPendingSubmit(true);
      setShowConfirmModal(true);
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    setFieldErrors({});

    try {
      await onSave(formData);
      setSuccess(true);
      // Update previous values after successful save
      previousValuesRef.current = {
        timeZone: formData.timeZone,
        currency: formData.currency,
      };
    } catch (err: any) {
      setError(err.message || 'Failed to save company settings');
    } finally {
      setIsSubmitting(false);
      setPendingSubmit(false);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    performSubmit();
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingSubmit(false);
    // Revert to previous values
    if (previousValuesRef.current.timeZone) {
      setFormData((prev) => ({
        ...prev,
        timeZone: previousValuesRef.current.timeZone || prev.timeZone,
        currency: previousValuesRef.current.currency || prev.currency,
      }));
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData({
        payDate: initialData.payDate || '',
        timeZone: initialData.timeZone || '',
        currency: initialData.currency || 'EGP',
      });
    } else {
      setFormData({
        payDate: '',
        timeZone: '',
        currency: 'EGP',
      });
    }
    setError('');
    setSuccess(false);
    onCancel();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
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
      isSubmitting={isSubmitting}
      onCancel={handleCancel}
      submitLabel="Save"
      cancelLabel="Cancel"
    >
      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          Company settings saved successfully!
        </div>
      )}

      {initialData && (
        <div className="p-4 bg-[var(--primary-50)] border border-[var(--primary-200)] rounded-xl mb-6 shadow-sm">
          <h3 className="text-lg font-bold text-[var(--primary-800)] mb-3 flex items-center gap-2">
            <span className="w-2 h-6 bg-[var(--primary-600)] rounded-full"></span>
            Current Company Settings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-[var(--primary-100)]">
              <span className="text-[var(--primary-700)] font-medium">Pay Date:</span>
              <span className="font-bold text-[var(--primary-900)] bg-white px-2 py-0.5 rounded border border-[var(--primary-200)]">
                {initialData.payDate ? formatDate(initialData.payDate) : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--primary-100)]">
              <span className="text-[var(--primary-700)] font-medium">Timezone:</span>
              <span className="font-bold text-[var(--primary-900)] bg-white px-2 py-0.5 rounded border border-[var(--primary-200)]">
                {initialData.timeZone || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--primary-100)]">
              <span className="text-[var(--primary-700)] font-medium">Currency:</span>
              <span className="font-bold text-[var(--primary-900)] bg-white px-2 py-0.5 rounded border border-[var(--primary-200)]">
                {initialData.currency || 'Not set'}
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
        <label className="form-label">
          Payroll Processing Date
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="date"
          name="payDate"
          value={formData.payDate}
          onChange={handleInputChange}
          required
          min={new Date().toISOString().split('T')[0]}
          className={`form-input ${fieldErrors.payDate
              ? 'border-red-600 ring-1 ring-red-500'
              : ''
            }`}
        />
        {fieldErrors.payDate && (
          <p className="text-red-600 text-sm mt-1 font-medium">{fieldErrors.payDate}</p>
        )}
        <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1 italic">
          Date when payroll is processed each period
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Timezone
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="timeZone"
          value={formData.timeZone}
          onChange={handleInputChange}
          required
          className={`form-input ${fieldErrors.timeZone
              ? 'border-red-600 ring-1 ring-red-500'
              : ''
            }`}
        >
          <option value="">Select Timezone</option>
          {timezoneGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.timezones.map((tz) => {
                const offset = getTimezoneOffset(tz.value);
                return (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} {offset && `(${offset})`}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
        {fieldErrors.timeZone && (
          <p className="text-red-600 text-sm mt-1 font-medium">{fieldErrors.timeZone}</p>
        )}
        <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1 italic">
          Timezone for payroll processing
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Currency
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleInputChange}
          required
          className={`form-input ${fieldErrors.currency
              ? 'border-red-600 ring-1 ring-red-500'
              : ''
            }`}
        >
          <option value="">Select Currency</option>
          {currencyOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {fieldErrors.currency && (
          <p className="text-red-600 text-sm mt-1 font-medium">{fieldErrors.currency}</p>
        )}
        <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1 italic">
          Default currency for payroll
        </p>
      </div>

      <Modal
        isOpen={showConfirmModal}
        title="Confirm Settings Change"
        onClose={handleCancelConfirm}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-primary)]">
            Changing these settings will affect all future payroll calculations. Continue?
          </p>
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleCancelConfirm}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="btn-primary"
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>
    </Form>
  );
}

