'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '@/lib/data';
import { AppData, MaintenanceRequest } from '@/types';
import { Plus, Wrench, Check, AlertTriangle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ propertyId: '', tenantId: '', description: '', urgency: 'normal' as 'emergency' | 'urgent' | 'normal' });

  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); });
  }, []);

  // Simulate AI triage - in MVP just assign based on keywords
  const triageUrgency = (description: string): 'emergency' | 'urgent' | 'normal' => {
    const lower = description.toLowerCase();
    if (lower.includes('flood') || lower.includes('gas') || lower.includes('no heat') || (lower.includes('leak') && lower.includes('major'))) {
      return 'emergency';
    }
    if (lower.includes('ac') || lower.includes('cooling') || lower.includes('no hot water') || lower.includes('leak')) {
      return 'urgent';
    }
    return 'normal';
  };

  const handleSave = async () => {
    if (!data || !formData.propertyId || !formData.description) return;
    
    const urgency = triageUrgency(formData.description);
    
    const newRequest: MaintenanceRequest = {
      id: generateId(),
      propertyId: formData.propertyId,
      tenantId: formData.tenantId || data.tenants.find(t => t.propertyId === formData.propertyId)?.id || '',
      description: formData.description,
      urgency,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const newData = { ...data, maintenanceRequests: [newRequest, ...data.maintenanceRequests] };
    await saveData(newData);
    setData(newData);
    setShowForm(false);
    setFormData({ propertyId: '', tenantId: '', description: '', urgency: 'normal' });
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'in_progress' | 'resolved') => {
    if (!data) return;
    
    const newData = {
      ...data,
      maintenanceRequests: data.maintenanceRequests.map(r => r.id === id ? { ...r, status } : r)
    };
    await saveData(newData);
    setData(newData);
  };

  const getPropertyAddress = (id: string) => data?.properties.find(p => p.id === id)?.address || 'Unknown';
  const getTenantName = (id: string) => data?.tenants.find(t => t.id === id)?.name || 'Unknown';

  const pendingRequests = data?.maintenanceRequests.filter(r => r.status === 'pending') || [];
  const inProgressRequests = data?.maintenanceRequests.filter(r => r.status === 'in_progress') || [];
  const resolvedRequests = data?.maintenanceRequests.filter(r => r.status === 'resolved') || [];

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'emergency') return <AlertTriangle size={16} />;
    if (urgency === 'urgent') return <Clock size={16} />;
    return <Wrench size={16} />;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const RequestCard = ({ req }: { req: MaintenanceRequest }) => (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className={`badge ${req.urgency === 'emergency' ? 'badge-emergency' : req.urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}`}>
            {getUrgencyIcon(req.urgency)} {req.urgency}
          </span>
        </div>
        <span className="text-xs text-[#64748B]">
          {new Date(req.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-[#1E293B] mb-2">{req.description}</p>
      <p className="text-xs text-[#64748B]">
        {getPropertyAddress(req.propertyId)} • {getTenantName(req.tenantId)}
      </p>
      {req.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => handleStatusChange(req.id, 'in_progress')} className="btn-primary text-xs py-1">
            Start Work
          </button>
          <button onClick={() => handleStatusChange(req.id, 'resolved')} className="btn-secondary text-xs py-1">
            <Check size={14} className="inline mr-1" /> Resolve
          </button>
        </div>
      )}
      {req.status === 'in_progress' && (
        <button onClick={() => handleStatusChange(req.id, 'resolved')} className="btn-primary text-xs py-1 mt-3">
          <Check size={14} className="inline mr-1" /> Mark Resolved
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Maintenance</h1>
          <p className="text-[#64748B] mt-1">Track and triage maintenance requests</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Request
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">New Maintenance Request</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Property *</label>
              <select className="input" value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})}>
                <option value="">Select property</option>
                {data?.properties.map(p => (
                  <option key={p.id} value={p.id}>{p.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tenant (optional)</label>
              <select className="input" value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})}>
                <option value="">Auto-detect from property</option>
                {data?.tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description *</label>
              <textarea 
                className="input h-24 resize-none" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the issue..."
              />
              <p className="text-xs text-[#64748B] mt-1">AI will auto-categorize urgency based on keywords</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary">Submit</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Pending */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B] mb-3">Pending ({pendingRequests.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingRequests.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgressRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B] mb-3">In Progress ({inProgressRequests.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {inProgressRequests.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolvedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1E293B] mb-3">Resolved ({resolvedRequests.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedRequests.map(req => <RequestCard key={req.id} req={req} />)}
          </div>
        </div>
      )}

      {data?.maintenanceRequests.length === 0 && (
        <div className="card text-center py-12">
          <Wrench className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-[#64748B]">No maintenance requests</p>
        </div>
      )}
    </div>
  );
}
