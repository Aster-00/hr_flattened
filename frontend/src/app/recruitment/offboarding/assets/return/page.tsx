"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAssetsByOffboarding, createAssetReturn, markAssetAsReturned, deleteAssetReturn, getAllOffboardingRequests, updateAssetReturn } from '../../services';

export default function AssetReturnPage() {
    const searchParams = useSearchParams();

    // State for selection
    const [selectedReqId, setSelectedReqId] = useState(searchParams?.get('requestId') || '');
    const [selectedEmpId, setSelectedEmpId] = useState(searchParams?.get('employeeId') || '');
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    const [assets, setAssets] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAsset, setNewAsset] = useState({
        assetName: '',
        assetDescription: '',
        serialNumber: '',
        assetCategory: '',
        condition: 'GOOD',
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initial Load: If ID preset, load assets. If not, load requests list.
    useEffect(() => {
        if (selectedReqId) {
            fetchAssets(selectedReqId);
        } else {
            fetchActiveRequests();
            setIsLoading(false);
        }
    }, [selectedReqId]);

    const fetchActiveRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const data = await getAllOffboardingRequests({}, token);
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests');
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const fetchAssets = async (reqId: string) => {
        setIsLoading(true);
        try {
            const token = 'YOUR_AUTH_TOKEN';
            const data = await getAssetsByOffboarding(reqId, token);
            setAssets(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to fetch assets' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const reqId = e.target.value;
        if (!reqId) {
            setSelectedReqId('');
            setSelectedEmpId('');
            setAssets([]);
            return;
        }

        const req = requests.find(r => r._id === reqId);
        setSelectedReqId(reqId);

        let empId = '';
        if (req && req.employeeId) {
            empId = typeof req.employeeId === 'object' ? (req.employeeId._id || req.employeeId.id) : req.employeeId;
        }
        setSelectedEmpId(empId);
    };

    // Helper to generate a random 24-char hex string (ObjectId-like)
    const generateObjectId = () => {
        return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    };

    const handleAddAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = 'YOUR_AUTH_TOKEN';
            // Backend requires 'assetId' as ObjectId. Since we are creating ad-hoc asset, generate one.
            const payload = {
                ...newAsset,
                assetId: generateObjectId()
            };

            // Ensure employeeId is not empty for the URL parameter (backend service ignores it anyway but controller needs it)
            const empIdPayload = selectedEmpId || 'unknown-id';

            await createAssetReturn(selectedReqId, empIdPayload, payload, token);
            setMessage({ type: 'success', text: 'Asset added successfully' });
            setShowAddForm(false);
            setNewAsset({ assetName: '', assetDescription: '', serialNumber: '', assetCategory: '', condition: 'GOOD', notes: '' });
            fetchAssets(selectedReqId);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to add asset. Ensure request is valid.' });
        }
    };

    const handleMarkReturned = async (assetId: string) => {
        try {
            const token = 'YOUR_AUTH_TOKEN';
            // Use updateAssetReturn to mark SPECIFIC asset
            await updateAssetReturn(selectedReqId, {
                assetId: assetId,
                returned: true,
                condition: 'GOOD'
            }, token);

            setMessage({ type: 'success', text: 'Asset marked as returned' });
            fetchAssets(selectedReqId);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to mark asset as returned' });
        }
    };


    const handleDelete = async (assetId: string) => {
        if (!confirm('Delete this last added asset? (This API stack pops last item)')) return;
        try {
            const token = 'YOUR_AUTH_TOKEN';
            await deleteAssetReturn(selectedReqId, token);
            setMessage({ type: 'success', text: 'Last asset removed' });
            fetchAssets(selectedReqId);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete asset' });
        }
    };

    // UI Styles
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/recruitment/offboarding" style={{ color: 'var(--recruitment)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Offboarding
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--recruitment)', marginBottom: '0.5rem' }}>
                    Asset Return
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Track and manage employee asset returns
                </p>
            </div>

            {/* SELECTION DROPDOWN */}
            {!searchParams?.get('requestId') && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Select Employee / Request</label>
                    <select
                        onChange={handleRequestSelect}
                        value={selectedReqId}
                        style={inputStyle}
                    >
                        <option value="">-- Select Offboarding Request --</option>
                        {requests.map(req => (
                            <option key={req._id} value={req._id}>
                                {req.employeeId && typeof req.employeeId === 'object'
                                    ? `${req.employeeId.firstName || 'Employee'} (${req.employeeId.employeeId || 'ID'})`
                                    : `Employee ID: ${req.employeeId || 'Unknown'}`}
                                {' - ' + (req.reason || 'Reason N/A')}
                                {' - ' + req._id}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                }}>
                    {message.text}
                </div>
            )}

            {selectedReqId ? (
                <>
                    <div style={{ marginBottom: '1.5rem' }}>
                        {/* Only show Add button if you want returning Assets to imply Adding too */}
                        {/* But I'll keep it for now as "Manage Assets" usually implies adding missing ones to the list */}
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'var(--recruitment)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            {showAddForm ? 'Cancel' : '+ Add Asset'}
                        </button>
                    </div>

                    {showAddForm && (
                        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '2rem', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--recruitment)' }}>Add New Asset</h3>
                            <form onSubmit={handleAddAsset}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Asset Name *</label>
                                        <input type="text" required value={newAsset.assetName} onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })} style={inputStyle} placeholder="e.g., Laptop" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Serial Number</label>
                                        <input type="text" value={newAsset.serialNumber} onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })} style={inputStyle} placeholder="e.g., SN12345" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Category</label>
                                        <select value={newAsset.assetCategory} onChange={(e) => setNewAsset({ ...newAsset, assetCategory: e.target.value })} style={inputStyle}>
                                            <option value="">Select category</option>
                                            <option value="ELECTRONICS">Electronics</option>
                                            <option value="FURNITURE">Furniture</option>
                                            <option value="EQUIPMENT">Equipment</option>
                                            <option value="VEHICLE">Vehicle</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                                    <textarea value={newAsset.assetDescription} onChange={(e) => setNewAsset({ ...newAsset, assetDescription: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Asset description..." />
                                </div>
                                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--recruitment)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                                    Save Asset
                                </button>
                            </form>
                        </div>
                    )}

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading assets...</div>
                    ) : assets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', color: 'var(--text-secondary)' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No assets tracked</h3>
                            <p>There are no assets recorded for this employee yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {assets.map((asset: any, index) => (
                                <div key={index} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{asset.name}</h3>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{asset.condition || 'Unknown Condition'} {asset.returned && '• Returned'}</div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: asset.returned ? '#d4edda' : '#fff3cd',
                                            color: asset.returned ? '#155724' : '#856404',
                                        }}>
                                            {asset.returned ? 'RETURNED' : 'PENDING'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {!asset.returned && (
                                            <button onClick={() => handleMarkReturned(asset.equipmentId)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--recruitment)', color: 'white', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
                                                Mark as Returned
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(asset.equipmentId)} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Please select an Offboarding Request to view and manage assets.
                </div>
            )}
        </div>
    );
}
