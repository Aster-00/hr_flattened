'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';
import { ENUMS, policyTypeOptions, applicabilityOptions } from '../lib/enums';

interface PayrollPolicy {
  _id: string;
  policyName: string;
  policyType: string;
  description: string;
  effectiveDate: string;
  ruleDefinition: {
    percentage?: number;
    fixedAmount?: number;
    threshold?: number;
  };
  applicability: string;
  status: 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export default function PayrollPolicies() {
  const [policies, setPolicies] = useState<PayrollPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<PayrollPolicy | null>(null);
  const [editItem, setEditItem] = useState<PayrollPolicy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    policyName: '',
    policyType: '',
    description: '',
    effectiveDate: '',
    ruleDefinition: { percentage: '', fixedAmount: '', threshold: '' },
    applicability: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/payroll-configuration/payroll-policies?t=${Date.now()}`);
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('rule_')) {
      const ruleKey = name.replace('rule_', '');
      setFormData((prev) => ({
        ...prev,
        ruleDefinition: { ...prev.ruleDefinition, [ruleKey]: value === '' ? '' : parseFloat(value) },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validation
      if (!formData.policyName.trim()) {
        setError('Policy name is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.policyType) {
        setError('Policy type is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        setError('Description is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.effectiveDate) {
        setError('Effective date is required');
        setIsSubmitting(false);
        return;
      }
      if (!formData.applicability) {
        setError('Applicability is required');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        ruleDefinition: {
          ...(formData.ruleDefinition.percentage !== '' && { percentage: Number(formData.ruleDefinition.percentage) }),
          ...(formData.ruleDefinition.fixedAmount !== '' && { fixedAmount: Number(formData.ruleDefinition.fixedAmount) }),
          ...(formData.ruleDefinition.threshold !== '' && { threshold: Number(formData.ruleDefinition.threshold) }),
        },
        status: formData.status,
      };

      if (editItem) {
        await apiClient.patch(`/payroll-configuration/payroll-policies/${editItem._id}`, payload);
      } else {
        await apiClient.post('/payroll-configuration/payroll-policies', payload);
      }
      await fetchPolicies();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PayrollPolicy) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await apiClient.delete(`/payroll-configuration/payroll-policies/${item._id}`);
        await fetchPolicies();
      } catch (err: any) {
        setError(err.message || 'Failed to delete policy');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      policyName: '',
      policyType: '',
      description: '',
      effectiveDate: '',
      ruleDefinition: { percentage: '', fixedAmount: '', threshold: '' },
      applicability: '',
      status: 'draft',
    });
    setEditItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: PayrollPolicy) => {
    setEditItem(item);
    setFormData({
      policyName: item.policyName,
      policyType: item.policyType,
      description: item.description,
      effectiveDate: item.effectiveDate.split('T')[0],
      ruleDefinition: {
        percentage: item.ruleDefinition.percentage?.toString() || '',
        fixedAmount: item.ruleDefinition.fixedAmount?.toString() || '',
        threshold: item.ruleDefinition.threshold?.toString() || '',
      },
      applicability: item.applicability,
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'policyName',
      label: 'Policy Name',
    },
    {
      key: 'policyType',
      label: 'Type',
    },
    {
      key: 'applicability',
      label: 'Applicability',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as 'draft' | 'approved' | 'rejected'} />,
    },
  ];

  return (
    <>
      <ListViewContainer
        title="Payroll Policies"
        data={policies}
        columns={columns}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={setViewItem}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No payroll policies configured yet"
      />

      <Modal isOpen={isFormOpen} title={editItem ? 'Edit Payroll Policy' : 'Create Payroll Policy'} onClose={() => setIsFormOpen(false)} size="lg">
        <Form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsFormOpen(false)}
          submitLabel={editItem ? 'Update' : 'Create'}
        >
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

          <FormField label="Policy Name" name="policyName" value={formData.policyName} onChange={handleInputChange} required />

          <FormField
            label="Policy Type"
            name="policyType"
            type="select"
            value={formData.policyType}
            onChange={handleInputChange}
            options={policyTypeOptions}
            required
          />

          <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleInputChange} required />

          <FormField
            label="Effective Date"
            name="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={handleInputChange}
            required
          />

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Rule Definition</h3>
            <FormField
              label="Percentage (%)"
              name="rule_percentage"
              type="number"
              value={formData.ruleDefinition.percentage}
              onChange={handleInputChange}
            />
            <FormField
              label="Fixed Amount"
              name="rule_fixedAmount"
              type="number"
              value={formData.ruleDefinition.fixedAmount}
              onChange={handleInputChange}
            />
            <FormField
              label="Threshold"
              name="rule_threshold"
              type="number"
              value={formData.ruleDefinition.threshold}
              onChange={handleInputChange}
            />
          </div>

          <FormField
            label="Applicability"
            name="applicability"
            type="select"
            value={formData.applicability}
            onChange={handleInputChange}
            options={applicabilityOptions}
            required
          />

          <FormField
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ]}
            required
          />
        </Form>
      </Modal>

      {viewItem && (
        <ViewDetailsModal
          item={viewItem}
          fields={[
            { key: 'policyName', label: 'Policy Name' },
            { key: 'policyType', label: 'Policy Type' },
            { key: 'description', label: 'Description' },
            { key: 'effectiveDate', label: 'Effective Date', render: (v) => new Date(v).toLocaleDateString() },
            {
              key: 'ruleDefinition',
              label: 'Rule Definition',
              render: (v) => `Percentage: ${v.percentage}%, Fixed: ${v.fixedAmount}, Threshold: ${v.threshold}`,
            },
            { key: 'applicability', label: 'Applicability' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          ]}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
