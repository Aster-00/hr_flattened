'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';

interface InsuranceBracket {
    _id: string;
    name: string;
    minSalary: number;
    maxSalary: number;
    employeeRate: number;
    employerRate: number;
    status: 'draft' | 'approved' | 'rejected';
}

export default function InsuranceBrackets() {
    const [data, setData] = useState<InsuranceBracket[]>([]);
    const [viewItem, setViewItem] = useState<InsuranceBracket | null>(null);
    const [editItem, setEditItem] = useState<InsuranceBracket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        minSalary: '',
        maxSalary: '',
        employeeRate: '',
        employerRate: '',
        status: 'draft',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get(`/payroll-configuration/insurance-brackets?t=${Date.now()}`);
            setData(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Error fetching insurance brackets:', err);
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
                amount: formData.amount ? parseFloat(formData.amount) : 0,
                minSalary: parseFloat(formData.minSalary),
                maxSalary: parseFloat(formData.maxSalary),
                employeeRate: parseFloat(formData.employeeRate),
                employerRate: parseFloat(formData.employerRate),
                status: formData.status,
            };

            if (editItem) {
                await apiClient.patch(`/payroll-configuration/insurance-brackets/${editItem._id}`, payload);
            } else {
                await apiClient.post('/payroll-configuration/insurance-brackets', payload);
            }
            await fetchData();
            setIsFormOpen(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to save insurance bracket');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item: InsuranceBracket) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            try {
                await apiClient.delete(`/payroll-configuration/insurance-brackets/${item._id}`);
                await fetchData();
            } catch (err: any) {
                alert(err.message || 'Failed to delete record');
            }
        }
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setFormData({
            name: item.name,
            amount: (item as any).amount?.toString() || '',
            minSalary: item.minSalary.toString(),
            maxSalary: item.maxSalary.toString(),
            employeeRate: item.employeeRate.toString(),
            employerRate: item.employerRate.toString(),
            status: item.status || 'draft',
        });
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            minSalary: '',
            maxSalary: '',
            employeeRate: '',
            employerRate: '',
            status: 'draft',
        });
        setEditItem(null);
        setError('');
    };

    const approve = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await apiClient.patch(`/payroll-configuration/insurance-brackets/${id}/status`, { status });
            fetchData();
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'minSalary', label: 'Min Salary', render: (v: number) => `$${v.toLocaleString()}` },
        { key: 'maxSalary', label: 'Max Salary', render: (v: number) => `$${v.toLocaleString()}` },
        {
            key: 'status',
            label: 'Status',
            render: (v: string, row: InsuranceBracket) => (
                <div className="flex gap-2 items-center">
                    <StatusBadge status={v as any} />
                    {v === 'draft' && (
                        <div className="flex gap-2 ml-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); approve(row._id, 'approved'); }}
                                className="text-green-600 hover:text-green-800 text-xs font-semibold uppercase tracking-wider bg-green-50 px-2 py-1 rounded transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); approve(row._id, 'rejected'); }}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold uppercase tracking-wider bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <ListViewContainer
                title="Insurance Brackets"
                data={data}
                columns={columns}
                onAdd={() => { resetForm(); setIsFormOpen(true); }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={setViewItem}
                isLoading={isLoading}
            />

            <Modal isOpen={isFormOpen} title={editItem ? "Edit Insurance Bracket" : "Create Insurance Bracket"} onClose={() => setIsFormOpen(false)} size="md">
                <Form
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => setIsFormOpen(false)}
                    submitLabel={editItem ? "Update" : "Create"}
                >
                    {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">{error}</div>}

                    <FormField
                        label="Bracket Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Level 1 Insurance"
                        required
                    />

                    <FormField
                        label="Insurance Amount / Cap (Optional)"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Min Salary"
                            name="minSalary"
                            type="number"
                            value={formData.minSalary}
                            onChange={handleInputChange}
                            placeholder="0"
                            required
                        />
                        <FormField
                            label="Max Salary"
                            name="maxSalary"
                            type="number"
                            value={formData.maxSalary}
                            onChange={handleInputChange}
                            placeholder="10000"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Employee Rate (%)"
                            name="employeeRate"
                            type="number"
                            value={formData.employeeRate}
                            onChange={handleInputChange}
                            placeholder="11"
                            required
                        />
                        <FormField
                            label="Employer Rate (%)"
                            name="employerRate"
                            type="number"
                            value={formData.employerRate}
                            onChange={handleInputChange}
                            placeholder="18.75"
                            required
                        />
                    </div>

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
                        { key: 'name', label: 'Name' },
                        { key: 'minSalary', label: 'Min Salary', render: (v) => `$${v.toLocaleString()}` },
                        { key: 'maxSalary', label: 'Max Salary', render: (v) => `$${v.toLocaleString()}` },
                        { key: 'employeeRate', label: 'Employee Rate (%)' },
                        { key: 'employerRate', label: 'Employer Rate (%)' },
                        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    ]}
                    onClose={() => setViewItem(null)}
                />
            )}
        </>
    );
}
