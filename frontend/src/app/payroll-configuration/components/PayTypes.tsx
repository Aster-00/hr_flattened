'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';
import { payTypeOptions } from '../lib/enums';

interface PayType {
  _id: string;
  type: string;
  amount: number;
  description?: string;
  status: 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export default function PayTypes() {
  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<PayType | null>(null);
  const [editItem, setEditItem] = useState<PayType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchPayTypes();
  }, []);

  const fetchPayTypes = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/payroll-configuration/pay-types?t=${Date.now()}`);
      setPayTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pay types:', err);
      setError('Failed to load pay types');
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
      const amount = formData.amount === '' ? 0 : parseFloat(formData.amount);

      if (!formData.type) {
        setError('Pay type is required');
        setIsSubmitting(false);
        return;
      }

      if (amount > 0 && amount < 6000) {
        setError('Amount must be at least 6000');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        type: formData.type,
        amount: amount,
        description: formData.description || undefined,
        status: formData.status,
      };

      if (editItem) {
        await apiClient.patch(`/payroll-configuration/pay-types/${editItem._id}`, payload);
      } else {
        await apiClient.post('/payroll-configuration/pay-types', payload);
      }
      await fetchPayTypes();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save pay type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PayType) => {
    if (window.confirm('Are you sure you want to delete this pay type?')) {
      try {
        await apiClient.delete(`/payroll-configuration/pay-types/${item._id}`);
        await fetchPayTypes();
      } catch (err: any) {
        setError(err.message || 'Failed to delete pay type');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
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

  const handleEdit = (item: PayType) => {
    setEditItem(item);
    setFormData({
      type: item.type,
      amount: item.amount.toString(),
      description: item.description || '',
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'description',
      label: 'Description',
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
        title="Pay Types"
        data={payTypes}
        columns={columns}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={setViewItem}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No pay types configured yet"
      />

      <Modal isOpen={isFormOpen} title={editItem ? 'Edit Pay Type' : 'Create Pay Type'} onClose={() => setIsFormOpen(false)} size="md">
        <Form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsFormOpen(false)}
          submitLabel={editItem ? 'Update' : 'Create'}
        >
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

          <FormField
            label="Pay Type"
            name="type"
            type="select"
            value={formData.type}
            onChange={handleInputChange}
            options={payTypeOptions}
            required
          />

          <FormField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="6000"
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the pay type (optional)"
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
            { key: 'type', label: 'Pay Type', render: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
            { key: 'amount', label: 'Amount', render: (v) => `$${v.toLocaleString()}` },
            { key: 'description', label: 'Description' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          ]}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
