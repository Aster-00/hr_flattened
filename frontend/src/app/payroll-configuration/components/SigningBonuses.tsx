'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';

interface SigningBonus {
  _id: string;
  name: string;
  amount: number;
  description?: string;
  status: 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export default function SigningBonuses() {
  const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<SigningBonus | null>(null);
  const [editItem, setEditItem] = useState<SigningBonus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchBonuses();
  }, []);

  const fetchBonuses = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/payroll-configuration/signing-bonus?t=${Date.now()}`);
      setBonuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching signing bonuses:', err);
      setError('Failed to load signing bonuses');
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
        status: formData.status,
        ...(formData.description && { description: formData.description }),
      };

      if (editItem) {
        await apiClient.patch(`/payroll-configuration/signing-bonus/${editItem._id}`, payload);
      } else {
        await apiClient.post('/payroll-configuration/signing-bonus', payload);
      }
      await fetchBonuses();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save signing bonus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SigningBonus) => {
    if (window.confirm('Are you sure you want to delete this signing bonus?')) {
      try {
        await apiClient.delete(`/payroll-configuration/signing-bonus/${item._id}`);
        await fetchBonuses();
      } catch (err: any) {
        setError(err.message || 'Failed to delete signing bonus');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      description: '',
      status: 'draft',
    });
    setEditItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: SigningBonus) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      description: item.description || '',
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Bonus Name',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => `$${value.toLocaleString()}`,
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
        title="Signing Bonuses"
        data={bonuses}
        columns={columns}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={setViewItem}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No signing bonuses configured yet"
      />

      <Modal isOpen={isFormOpen} title={editItem ? 'Edit Signing Bonus' : 'Create Signing Bonus'} onClose={() => setIsFormOpen(false)} size="md">
        <Form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsFormOpen(false)}
          submitLabel={editItem ? 'Update' : 'Create'}
        >
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

          <FormField
            label="Bonus Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., New Graduate Signing Bonus"
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
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description"
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
            { key: 'name', label: 'Bonus Name' },
            { key: 'amount', label: 'Amount', render: (v) => `$${v.toLocaleString()}` },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          ]}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
