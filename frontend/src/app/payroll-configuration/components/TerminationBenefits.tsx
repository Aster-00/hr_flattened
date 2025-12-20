'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';

interface TerminationBenefit {
  _id: string;
  name: string;
  amount: number;
  terms?: string;
  status: 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export default function TerminationBenefits() {
  const [benefits, setBenefits] = useState<TerminationBenefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<TerminationBenefit | null>(null);
  const [editItem, setEditItem] = useState<TerminationBenefit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    terms: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/payroll-configuration/termination-benefit?t=${Date.now()}`);
      setBenefits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching termination benefits:', err);
      setError('Failed to load termination benefits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        terms: formData.terms,
        status: formData.status,
      };

      if (editItem) {
        await apiClient.patch(`/payroll-configuration/termination-benefit/${editItem._id}`, payload);
      } else {
        await apiClient.post('/payroll-configuration/termination-benefit', payload);
      }
      await fetchBenefits();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save termination benefit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: TerminationBenefit) => {
    if (window.confirm('Are you sure you want to delete this termination benefit?')) {
      try {
        await apiClient.delete(`/payroll-configuration/termination-benefit/${item._id}`);
        await fetchBenefits();
      } catch (err: any) {
        setError(err.message || 'Failed to delete termination benefit');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      terms: '',
      status: 'draft',
    });
    setEditItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: TerminationBenefit) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      terms: item.terms || '',
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Benefit Name',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'terms',
      label: 'Terms',
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
        title="Termination & Resignation Benefits"
        data={benefits}
        columns={columns}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={setViewItem}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No termination benefits configured yet"
      />

      <Modal isOpen={isFormOpen} title={editItem ? 'Edit Termination Benefit' : 'Create Termination Benefit'} onClose={() => setIsFormOpen(false)} size="lg">
        <Form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsFormOpen(false)}
          submitLabel={editItem ? 'Update' : 'Create'}
        >
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

          <FormField
            label="Benefit Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., End of Service Gratuity"
            required
          />

          <FormField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0"
            required
          />

          <FormField
            label="Terms & Conditions"
            name="terms"
            type="textarea"
            value={formData.terms}
            onChange={handleInputChange}
            placeholder="Describe the terms of this benefit (optional)"
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
            { key: 'name', label: 'Benefit Name' },
            { key: 'amount', label: 'Amount', render: (v) => `$${v.toLocaleString()}` },
            { key: 'terms', label: 'Terms' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          ]}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
