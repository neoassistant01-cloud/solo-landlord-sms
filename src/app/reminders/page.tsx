'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '@/lib/data';
import { AppData, Reminder } from '@/types';
import { Plus, Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RemindersPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ tenantId: '', type: 'before', days: '3' });

  useEffect(() => {
    loadData().then(d => { setData(d); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!data || !formData.tenantId) return;
    
    const newReminder: Reminder = {
      id: generateId(),
      tenantId: formData.tenantId,
      type: formData.type as 'before' | 'due' | 'after',
      days: parseInt(formData.days),
      enabled: true,
      createdAt: new Date().toISOString()
    };

    const newData = { ...data, reminders: [...data.reminders, newReminder] };
    await saveData(newData);
    setData(newData);
    setShowForm(false);
    setFormData({ tenantId: '', type: 'before', days: '3' });
  };

  const handleToggle = async (id: string) => {
    if (!data) return;
    
    const newData = {
      ...data,
      reminders: data.reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    };
    await saveData(newData);
    setData(newData);
  };

  const handleDelete = async (id: string) => {
    if (!data) return;
    if (!confirm('Delete this reminder?')) return;
    
    const newData = { ...data, reminders: data.reminders.filter(r => r.id !== id) };
    await saveData(newData);
    setData(newData);
  };

  const getReminderLabel = (type: string, days: number) => {
    if (type === 'before') return `${days} day${days > 1 ? 's' : ''} before due`;
    if (type === 'due') return 'Day of due date';
    if (type === 'after') return `${days} day${days > 1 ? 's' : ''} after due`;
    return '';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  // Group reminders by tenant
  const tenantsWithReminders = data?.tenants.map(tenant => ({
    tenant,
    reminders: data.reminders.filter(r => r.tenantId === tenant.id)
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Rent Reminders</h1>
          <p className="text-[#64748B] mt-1">Configure automated SMS reminders for rent</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Reminder
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Add New Reminder</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Tenant *</label>
              <select className="input" value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})}>
                <option value="">Select tenant</option>
                {data?.tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">When</label>
              <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="before">Before due date</option>
                <option value="due">On due date</option>
                <option value="after">After due date</option>
              </select>
            </div>
            <div>
              <label className="label">Days (before/after)</label>
              <input className="input" type="number" min="1" max="30" value={formData.days} onChange={e => setFormData({...formData, days: String(parseInt(e.target.value) || 1)})} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Reminders by Tenant */}
      {tenantsWithReminders.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-[#64748B]">No reminders configured</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenantsWithReminders.map(({ tenant, reminders }) => (
            <div key={tenant.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[#1E293B]">{tenant.name}</h3>
                  <p className="text-sm font-mono text-[#3B82F6]">{tenant.phone}</p>
                </div>
                <span className="text-sm text-[#64748B]">{reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="space-y-2">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell size={16} className={reminder.enabled ? 'text-[#3B82F6]' : 'text-gray-400'} />
                      <span className="text-sm text-[#1E293B]">{getReminderLabel(reminder.type, reminder.days)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggle(reminder.id)} className="flex items-center gap-1">
                        {reminder.enabled ? (
                          <ToggleRight size={32} className="text-[#3B82F6]" />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-400" />
                        )}
                      </button>
                      <button onClick={() => handleDelete(reminder.id)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
