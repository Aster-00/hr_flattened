'use client';

import { useState } from 'react';
import { OnApiRecruitment } from '../ONservices';

export default function UploadDocumentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ownerId, setOwnerId] = useState('');
  const [type, setType] = useState('contract');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!ownerId) {
      setError('Owner ID is required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);      // MUST match FileInterceptor('file')
      formData.append('ownerId', ownerId);
      formData.append('type', type);

      const res = await OnApiRecruitment.uploadDocument(formData);

      setSuccess('Document uploaded successfully');
      console.log('Uploaded document:', res);

      setFile(null);
      setOwnerId('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h2>Upload Document</h2>

      <form onSubmit={handleSubmit}>
        {/* Owner ID */}
        <div style={{ marginBottom: 12 }}>
          <label>Owner ID</label>
          <input
            type="text"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            placeholder="MongoDB ObjectId"
            required
          />
        </div>

        {/* Document Type */}
        <div style={{ marginBottom: 12 }}>
          <label>Document Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="cv">CV</option>
            <option value="contract">Contract</option>
            <option value="id">ID</option>
            <option value="certificate">Certificate</option>
            <option value="resignation">Resignation</option>
          </select>
        </div>

        {/* File */}
        <div style={{ marginBottom: 12 }}>
          <label>File</label>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
              }
            }}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {/* Messages */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}
