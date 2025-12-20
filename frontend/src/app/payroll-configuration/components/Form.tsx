'use client';

import { ChangeEvent, FormEvent, ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  children?: ReactNode;
  options?: { label: string; value: string | number }[];
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  placeholder,
  children,
  options,
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`form-input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          rows={4}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`form-input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`form-input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

interface FormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

export function Form({ onSubmit, children, isSubmitting = false, submitLabel = 'Save', cancelLabel = 'Cancel', onCancel }: FormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        {children}
      </div>
      <div className="modal-footer mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex items-center gap-2"
        >
          {isSubmitting && <span className="animate-spin text-sm">⌛</span>}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
