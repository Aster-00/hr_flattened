'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { ListViewContainer, ViewDetailsModal } from './Containers';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../lib/apiClient';

interface TaxRule {
    _id: string;
    name: string;
    description?: string;
    rate: number;
    status: 'draft' | 'approved' | 'rejected';
}

export default function TaxRules() {
    const [rules, setRules] = useState<TaxRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewItem, setViewItem] = useState<TaxRule | null>(null);
    const [editItem, setEditItem] = useState<TaxRule | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', rate: '', status: 'draft' });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get(`/payroll-configuration/tax-rule?t=${Date.now()}`);
            setRules(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tax rules:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            description: formData.description,
            rate: Number(formData.rate),
            status: formData.status,
        };

        if (editItem) {
            await apiClient.patch(`/payroll-configuration/tax-rule/${editItem._id}`, payload);
        } else {
            await apiClient.post('/payroll-configuration/tax-rule', payload);
        }

        setIsFormOpen(false);
        setEditItem(null);
        fetchRules();
    };

    const handleDelete = async (item: TaxRule) => {
        if (window.confirm(`Are you sure you want to delete the tax rule "${item.name}"?`)) {
            try {
                await apiClient.delete(`/payroll-configuration/tax-rule/${item._id}`);
                fetchRules();
            } catch (error) {
                console.error('Error deleting tax rule:', error);
                alert('Failed to delete tax rule');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'rate', label: 'Rate (%)' },
        {
            key: 'status',
            label: 'Status',
            render: (v: string, row: TaxRule) => <StatusBadge status={row.status} />,
        },
    ];

    return (
        <>
            <ListViewContainer
                title="Tax Rules"
                data={rules}
                columns={columns}
                onAdd={() => {
                    setEditItem(null);
                    setFormData({ name: '', description: '', rate: '', status: 'draft' });
                    setIsFormOpen(true);
                }}
                onEdit={(i) => {
                    setEditItem(i);
                    setFormData({
                        name: i.name,
                        description: i.description || '',
                        rate: i.rate.toString(),
                        status: i.status || 'draft'
                    });
                    setIsFormOpen(true);
                }}
                onDelete={handleDelete}
                onView={setViewItem}
                isLoading={isLoading}
            />

            <Modal isOpen={isFormOpen} title={editItem ? "Edit Tax Rule" : "Add Tax Rule"} onClose={() => setIsFormOpen(false)}>
                <Form onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)}>
                    <FormField label="Name" name="name" value={formData.name} onChange={handleChange} required />
                    <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} />
                    <FormField label="Rate (%)" name="rate" type="number" value={formData.rate} onChange={handleChange} required />
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status}
                        onChange={handleChange}
                        options={[
                            { label: 'Draft', value: 'draft' },
                            { label: 'Approved', value: 'approved' },
                            { label: 'Rejected', value: 'rejected' }
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
                        { key: 'rate', label: 'Rate (%)' },
                        { key: 'status', label: 'Status', render: (v: 'draft' | 'approved' | 'rejected') => <StatusBadge status={v} /> },
                    ]}
                    onClose={() => setViewItem(null)}
                />
            )}
        </>
    );
}
