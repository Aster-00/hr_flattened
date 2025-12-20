'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';

interface PayGrade {
  _id: string;
  grade: string;
  baseSalary: number;
  grossSalary: number;
  status: 'draft' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export default function PayGrades() {
  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewItem, setViewItem] = useState<PayGrade | null>(null);
  const [editItem, setEditItem] = useState<PayGrade | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    grade: '',
    baseSalary: '',
    grossSalary: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchPayGrades();
  }, []);

  const fetchPayGrades = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get(`/payroll-configuration/pay-grades?t=${Date.now()}`);
      setPayGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pay grades:', err);
      setError('Failed to load pay grades');
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
        grade: formData.grade,
        baseSalary: parseFloat(formData.baseSalary),
        grossSalary: parseFloat(formData.grossSalary),
        status: formData.status,
      };
      console.log('Sending payload:', JSON.stringify(payload));

      if (editItem) {
        await apiClient.patch(`/payroll-configuration/pay-grades/${editItem._id}`, payload);
      } else {
        await apiClient.post('/payroll-configuration/pay-grades', payload);
      }
      await fetchPayGrades();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save pay grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PayGrade) => {
    if (window.confirm('Are you sure you want to delete this pay grade?')) {
      try {
        await apiClient.delete(`/payroll-configuration/pay-grades/${item._id}`);
        await fetchPayGrades();
      } catch (err: any) {
        setError(err.message || 'Failed to delete pay grade');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      grade: '',
      baseSalary: '',
      grossSalary: '',
      status: 'draft',
    });
    setEditItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (item: PayGrade) => {
    setEditItem(item);
    setFormData({
      grade: item.grade,
      baseSalary: item.baseSalary.toString(),
      grossSalary: item.grossSalary.toString(),
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: 'grade',
      label: 'Grade / Position',
    },
    {
      key: 'baseSalary',
      label: 'Base Salary',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'grossSalary',
      label: 'Gross Salary',
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
        title="Pay Grades"
        data={payGrades}
        columns={columns}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onView={setViewItem}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No pay grades configured yet"
      />

      <Modal isOpen={isFormOpen} title={editItem ? 'Edit Pay Grade' : 'Create Pay Grade'} onClose={() => setIsFormOpen(false)} size="md">
        <Form
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setIsFormOpen(false)}
          submitLabel={editItem ? 'Update' : 'Create'}
        >
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

          <FormField
            label="Grade / Position"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            placeholder="e.g., Senior Developer, Mid-Level TA"
            required
          />

          <FormField
            label="Base Salary"
            name="baseSalary"
            type="number"
            value={formData.baseSalary}
            onChange={handleInputChange}
            placeholder="6000"
            required
          />

          <FormField
            label="Gross Salary"
            name="grossSalary"
            type="number"
            value={formData.grossSalary}
            onChange={handleInputChange}
            placeholder="8000"
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
            { key: 'grade', label: 'Grade / Position' },
            { key: 'baseSalary', label: 'Base Salary', render: (v) => `$${v.toLocaleString()}` },
            { key: 'grossSalary', label: 'Gross Salary', render: (v) => `$${v.toLocaleString()}` },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          ]}
          onClose={() => setViewItem(null)}
        />
      )}
    </>
  );
}
