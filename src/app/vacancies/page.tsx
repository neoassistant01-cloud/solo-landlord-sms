'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '@/lib/data';
import { AppData, Vacancy } from '@/types';
import { Plus, Home, Send, Check, Building2 } from 'lucide-react';

export default function VacanciesPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ propertyId: '', availableDate: '', rentAmount: '', description: '' });

  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!data || !formData.propertyId || !formData.availableDate) return;
    
    const newVacancy: Vacancy = {
      id: generateId(),
      propertyId: formData.propertyId,
      availableDate: formData.availableDate,
      rentAmount: parseFloat(formData.rentAmount) || 0,
      description: formData.description,
      broadcastStatus: 'not_broadcast'
    };

    const newData = { ...data, vacancies: [...data.vacancies, newVacancy] };
    await saveData(newData);
    setData(newData);
    setShowForm(false);
    setFormData({ propertyId: '', availableDate: '', rentAmount: '', description: '' });
  };

  const handleBroadcast = async (vacancyId: string) => {
    if (!data) return;
    
    setBroadcastingId(vacancyId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const vacancy = data.vacancies.find(v => v.id === vacancyId);
    const property = data.properties.find(p => p.id === vacancy?.propertyId);
    
    // Log mock broadcast to console/file
    const broadcastLog = {
      timestamp: new Date().toISOString(),
      vacancyId,
      property: property?.address,
      platforms: ['Craigslist', 'Zillow', 'Facebook Marketplace', 'Apartments.com']
    };
    
    console.log('📢 VACANCY BROADCAST:', JSON.stringify(broadcastLog, null, 2));
    
    // Update status
    const newData = {
      ...data,
      vacancies: data.vacancies.map(v => v.id === vacancyId ? { ...v, broadcastStatus: 'broadcast' as const, broadcastDate: new Date().toISOString() } : v)
    };
    await saveData(newData);
    setData(newData);
    setBroadcastingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!data) return;
    if (!confirm('Remove this vacancy?')) return;
    
    const newData = { ...data, vacancies: data.vacancies.filter(v => v.id !== id) };
    await saveData(newData);
    setData(newData);
  };

  const getPropertyAddress = (id: string) => data?.properties.find(p => p.id === id)?.address || 'Unknown';

  // Filter out properties that are already tenanted
  const availableProperties = data?.properties.filter(p => 
    !data.tenants.some(t => t.propertyId === p.id)
  ) || [];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Vacancies</h1>
          <p className="text-[#64748B] mt-1">List vacant units and broadcast to platforms</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Vacancy
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Add New Vacancy</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Property *</label>
              <select className="input" value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})}>
                <option value="">Select property</option>
                {availableProperties.map(p => (
                  <option key={p.id} value={p.id}>{p.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Available Date *</label>
              <input className="input" type="date" value={formData.availableDate} onChange={e => setFormData({...formData, availableDate: e.target.value})} />
            </div>
            <div>
              <label className="label">Monthly Rent</label>
              <input className="input" type="number" value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: e.target.value})} placeholder="1500" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea 
                className="input h-24 resize-none" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the unit..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Vacancies List */}
      {data?.vacancies.length === 0 ? (
        <div className="card text-center py-12">
          <Home className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-[#64748B]">No vacant units. Add your first vacancy!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.vacancies.map(vacancy => (
            <div key={vacancy.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#EF4444] flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <button onClick={() => handleDelete(vacancy.id)} className="text-[#64748B] hover:text-red-500 text-sm">
                  Remove
                </button>
              </div>
              <h3 className="font-semibold text-[#1E293B]">{getPropertyAddress(vacancy.propertyId)}</h3>
              <p className="text-sm text-[#64748B]">Available: {new Date(vacancy.availableDate).toLocaleDateString()}</p>
              {vacancy.description && <p className="text-sm text-[#64748B] mt-2">{vacancy.description}</p>}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-lg font-bold text-[#3B82F6]">
                  ${vacancy.rentAmount.toLocaleString()}/mo
                </span>
                
                {vacancy.broadcastStatus === 'broadcast' ? (
                  <span className="flex items-center gap-1 text-sm text-[#10B981]">
                    <Check size={16} /> Broadcast
                  </span>
                ) : (
                  <button 
                    onClick={() => handleBroadcast(vacancy.id)}
                    disabled={broadcastingId === vacancy.id}
                    className="btn-primary flex items-center gap-1 text-xs"
                  >
                    {broadcastingId === vacancy.id ? (
                      <>Broadcasting...</>
                    ) : (
                      <><Send size={14} /> Broadcast</>
                    )}
                  </button>
                )}
              </div>
              
              {vacancy.broadcastDate && (
                <p className="text-xs text-[#64748B] mt-2">
                  Broadcast: {new Date(vacancy.broadcastDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
