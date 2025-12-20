'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Form, FormField } from './Form';
import { CRUDTable } from './CRUDTable';
import { StatusBadge } from './StatusBadge';

interface ListViewProps {
  title: string;
  data: any[];
  columns: { key: string; label: string; render?: (value: any, row: any) => any }[];
  onAdd: () => void;
  onEdit?: (item: any) => void;
  onView: (item: any) => void;
  onDelete?: (item: any) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ListViewContainer({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onView,
  onDelete,
  isLoading = false,
  emptyMessage = 'No data available',
}: ListViewProps) {
  return (
    <div className="p-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onAdd}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add New
          </button>
        </div>
        <CRUDTable
          data={data}
          columns={columns}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}

interface ViewDetailsProps {
  item: any;
  fields: { key: string; label: string; render?: (value: any) => any }[];
  onClose: () => void;
}

export function ViewDetailsModal({ item, fields, onClose }: ViewDetailsProps) {
  return (
    <Modal isOpen={!!item} title={`View Details`} onClose={onClose} size="lg">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="border-b pb-3">
            <label className="text-sm font-medium text-gray-600">{field.label}</label>
            <p className="text-gray-900 mt-1">
              {field.render ? field.render(item[field.key]) : item[field.key]}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
