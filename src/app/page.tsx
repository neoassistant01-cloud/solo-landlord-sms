'use client';

import { useState, useEffect } from 'react';
import { loadData } from '@/lib/data';
import { AppData } from '@/types';
import { Building2, Users, Wrench, Bell, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load data</div>;

  const pendingMaintenance = data.maintenanceRequests.filter(m => m.status === 'pending').length;
  const vacantUnits = data.vacancies.filter(v => v.broadcastStatus === 'not_broadcast').length;

  const stats = [
    { label: 'Properties', value: data.properties.length, icon: Building2, color: 'bg-[#3B82F6]', href: '/properties' },
    { label: 'Tenants', value: data.tenants.length, icon: Users, color: 'bg-[#10B981]', href: '/tenants' },
    { label: 'Pending Maintenance', value: pendingMaintenance, icon: Wrench, color: 'bg-[#F59E0B]', href: '/maintenance' },
    { label: 'Vacant Units', value: vacantUnits, icon: Building2, color: 'bg-[#EF4444]', href: '/vacancies' },
  ];

  const recentMaintenance = [...data.maintenanceRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const getPropertyAddress = (id: string) => data.properties.find(p => p.id === id)?.address || 'Unknown';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B]">Dashboard</h1>
        <p className="text-[#64748B] mt-1">Overview of your property portfolio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <div className="card cursor-pointer group">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
              <p className="text-sm text-[#64748B]">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/properties"><button className="btn-primary">Add Property</button></Link>
          <Link href="/tenants"><button className="btn-secondary">Add Tenant</button></Link>
          <Link href="/reminders"><button className="btn-secondary">Configure Reminders</button></Link>
          <Link href="/vacancies"><button className="btn-secondary">Broadcast Vacancy</button></Link>
        </div>
      </div>

      {/* Maintenance Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1E293B]">Recent Maintenance</h2>
          <Link href="/maintenance" className="text-sm text-[#3B82F6] hover:underline">View all</Link>
        </div>
        
        {recentMaintenance.length === 0 ? (
          <p className="text-[#64748B]">No maintenance requests</p>
        ) : (
          <div className="space-y-3">
            {recentMaintenance.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {req.urgency === 'emergency' ? (
                    <AlertTriangle className="text-[#EF4444]" size={18} />
                  ) : req.urgency === 'urgent' ? (
                    <Clock className="text-[#F59E0B]" size={18} />
                  ) : (
                    <Wrench className="text-[#10B981]" size={18} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#1E293B]">{getPropertyAddress(req.propertyId)}</p>
                    <p className="text-xs text-[#64748B] truncate max-w-[200px]">{req.description}</p>
                  </div>
                </div>
                <span className={`badge ${req.urgency === 'emergency' ? 'badge-emergency' : req.urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}`}>
                  {req.urgency}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="text-[#3B82F6]" size={20} />
            <h2 className="text-lg font-semibold text-[#1E293B]">Rent Reminders</h2>
          </div>
          <Link href="/reminders" className="text-sm text-[#3B82F6] hover:underline">Configure</Link>
        </div>
        <p className="text-[#64748B]">
          {data.reminders.filter(r => r.enabled).length} active reminder{data.reminders.filter(r => r.enabled).length !== 1 ? 's' : ''} configured across {data.tenants.length} tenants
        </p>
      </div>
    </div>
  );
}
