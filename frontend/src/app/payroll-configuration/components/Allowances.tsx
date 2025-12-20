'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';

interface Allowance {
  _id: string;
  name: string;
  amount: number;
  status: 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export default function Allowances() {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Allowance | null>(null);
  const [editItem, setEditItem] = useState<Allowance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchAllowances();
  }, []);

  const fetchAllowances = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/payroll-configuration/allowances?t=${Date.now()}`);
      setAllowances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching allowances:', err);
      setError('Failed to load allowances');
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
      };

      if (editItem) {
        await apiClient.patch(`/payroll-configuration/allowances/${editItem._id}`, payload);
      } else {
        await apiClient.post('/payroll-configuration/allowances', payload);
      }
      await fetchAllowances();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save allowance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Allowance) => {
    if (window.confirm('Are you sure you want to delete this allowance?')) {
      try {
        await apiClient.delete(`/payroll-configuration/allowances/${item._id}`);
        await fetchAllowances();
      } catch (err: any) {
        setError(err.message || 'Failed to delete allowance');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      status: 'draft',
    });
    setEditItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: Allowance) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Allowance Name',
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
        title="Allowances"
        data={allowances}
        columns={columns}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={setViewItem}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No allowances configured yet"
      />

      <Modal isOpen={isFormOpen} title={editItem ? 'Edit Allowance' : 'Create Allowance'} onClose={() => setIsFormOpen(false)} size="md">
        <Form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsFormOpen(false)}
          submitLabel={editItem ? 'Update' : 'Create'}
        >
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

          <FormField
            label="Allowance Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Housing Allowance, Transport Allowance"
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
            { key: 'name', label: 'Allowance Name' },
            { key: 'amount', label: 'Amount', render: (v) => `$${v.toLocaleString()}` },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          ]}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
