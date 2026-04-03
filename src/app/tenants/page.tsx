'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '@/lib/data';
import { AppData, Tenant } from '@/types';
import { Plus, Users, Trash2, Edit2, Phone } from 'lucide-react';

export default function TenantsPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', phone: '', email: '', propertyId: '', 
    leaseStart: '', leaseEnd: '', rentAmount: '' 
  });

  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!data || !formData.name || !formData.phone || !formData.propertyId) return;
    
    const newTenant: Tenant = {
      id: editingId || generateId(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      propertyId: formData.propertyId,
      leaseStart: formData.leaseStart,
      leaseEnd: formData.leaseEnd,
      rentAmount: parseFloat(formData.rentAmount) || 0,
      createdAt: editingId ? data.tenants.find(t => t.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    let updated: Tenant[];
    if (editingId) {
      updated = data.tenants.map(t => t.id === editingId ? newTenant : t);
    } else {
      updated = [...data.tenants, newTenant];
    }

    const newData = { ...data, tenants: updated };
    await saveData(newData);
    setData(newData);
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', propertyId: '', leaseStart: '', leaseEnd: '', rentAmount: '' });
  };

  const handleDelete = async (id: string) => {
    if (!data) return;
    if (!confirm('Delete this tenant?')) return;
    
    const newData = { ...data, tenants: data.tenants.filter(t => t.id !== id) };
    await saveData(newData);
    setData(newData);
  };

  const handleEdit = (tenant: Tenant) => {
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email || '',
      propertyId: tenant.propertyId,
      leaseStart: tenant.leaseStart,
      leaseEnd: tenant.leaseEnd,
      rentAmount: tenant.rentAmount.toString()
    });
    setEditingId(tenant.id);
    setShowForm(true);
  };

  const getPropertyAddress = (id: string) => data?.properties.find(p => p.id === id)?.address || 'Unknown';

  const filteredTenants = data?.tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone.includes(searchTerm)
  ) || [];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Tenants</h1>
          <p className="text-[#64748B] mt-1">Manage your tenant CRM</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', phone: '', email: '', propertyId: '', leaseStart: '', leaseEnd: '', rentAmount: '' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Tenant
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <input 
          className="input" 
          placeholder="Search by name or phone..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Tenant' : 'Add New Tenant'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input font-mono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+15551234567" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@email.com" />
            </div>
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
              <label className="label">Lease Start</label>
              <input className="input" type="date" value={formData.leaseStart} onChange={e => setFormData({...formData, leaseStart: e.target.value})} />
            </div>
            <div>
              <label className="label">Lease End</label>
              <input className="input" type="date" value={formData.leaseEnd} onChange={e => setFormData({...formData, leaseEnd: e.target.value})} />
            </div>
            <div>
              <label className="label">Monthly Rent</label>
              <input className="input" type="number" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: e.target.value})} placeholder="1500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Tenants List */}
      {filteredTenants.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-[#64748B]">No tenants found. Add your first tenant!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map(tenant => (
            <div key={tenant.id} className="card group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(tenant)} className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit2 size={16} className="text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(tenant.id)} className="p-1.5 hover:bg-red-50 rounded">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-[#1E293B]">{tenant.name}</h3>
              <p className="text-sm font-mono text-[#3B82F6]">{tenant.phone}</p>
              {tenant.email && <p className="text-xs text-[#64748B] mt-1">{tenant.email}</p>}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-[#64748B]">{getPropertyAddress(tenant.propertyId)}</p>
                <p className="text-xs text-[#64748B]">
                  {tenant.leaseStart} - {tenant.leaseEnd}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-medium text-[#1E293B]">${tenant.rentAmount.toLocaleString()}/mo</span>
                <a href={`tel:${tenant.phone}`} className="p-2 hover:bg-green-50 rounded-full">
                  <Phone size={16} className="text-[#10B981]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
