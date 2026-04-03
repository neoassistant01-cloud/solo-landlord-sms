'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '@/lib/data';
import { AppData, Property } from '@/types';
import { Plus, Building2, Trash2, Edit2 } from 'lucide-react';

export default function PropertiesPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ address: '', unit: '', bedrooms: '2', bathrooms: '1', rentAmount: '' });

  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!data || !formData.address || !formData.rentAmount) return;
    
    const newProperty: Property = {
      id: editingId || generateId(),
      address: formData.address,
      unit: formData.unit || undefined,
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      rentAmount: parseFloat(formData.rentAmount),
      createdAt: editingId ? data.properties.find(p => p.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    let updated: Property[];
    if (editingId) {
      updated = data.properties.map(p => p.id === editingId ? newProperty : p);
    } else {
      updated = [...data.properties, newProperty];
    }

    const newData = { ...data, properties: updated };
    await saveData(newData);
    setData(newData);
    setShowForm(false);
    setEditingId(null);
    setFormData({ address: '', unit: '', bedrooms: '2', bathrooms: '1', rentAmount: '' });
  };

  const handleDelete = async (id: string) => {
    if (!data) return;
    if (!confirm('Delete this property?')) return;
    
    const newData = { ...data, properties: data.properties.filter(p => p.id !== id) };
    await saveData(newData);
    setData(newData);
  };

  const handleEdit = (property: Property) => {
    setFormData({
      address: property.address,
      unit: property.unit || '',
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      rentAmount: property.rentAmount.toString()
    });
    setEditingId(property.id);
    setShowForm(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Properties</h1>
          <p className="text-[#64748B] mt-1">Manage your rental properties</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ address: '', unit: '', bedrooms: '2', bathrooms: '1', rentAmount: '' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Property
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Address *</label>
              <input className="input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main Street" />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Apt 1" />
            </div>
            <div>
              <label className="label">Bedrooms</label>
              <select className="input" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})}>
                <option value="0">Studio</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="label">Bathrooms</label>
              <select className="input" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})}>
                <option value="1">1</option>
                <option value="1.5">1.5</option>
                <option value="2">2</option>
                <option value="2.5">2.5</option>
                <option value="3">3+</option>
              </select>
            </div>
            <div>
              <label className="label">Monthly Rent *</label>
              <input className="input" type="number" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: e.target.value})} placeholder="1500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Properties List */}
      {data && data.properties.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-[#64748B]">No properties yet. Add your first property!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data!.properties.map(property => (
            <div key={property.id} className="card group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(property)} className="p-1.5 hover:bg-gray-100 rounded">
                    <Edit2 size={16} className="text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(property.id)} className="p-1.5 hover:bg-red-50 rounded">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-[#1E293B]">{property.address}</h3>
              {property.unit && <p className="text-sm text-[#64748B]">Unit {property.unit}</p>}
              <div className="flex gap-4 mt-3 text-sm text-[#64748B]">
                <span>{property.bedrooms} bed</span>
                <span>{property.bathrooms} bath</span>
              </div>
              <p className="text-lg font-bold text-[#3B82F6] mt-3">${property.rentAmount.toLocaleString()}/mo</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
