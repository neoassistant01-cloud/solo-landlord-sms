export interface Property {
  id: string;
  address: string;
  unit?: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  propertyId: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  tenantId: string;
  type: 'before' | 'due' | 'after';
  days: number;
  enabled: boolean;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  description: string;
  photoUrl?: string;
  urgency: 'emergency' | 'urgent' | 'normal';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface Vacancy {
  id: string;
  propertyId: string;
  availableDate: string;
  rentAmount: number;
  description: string;
  broadcastStatus: 'not_broadcast' | 'broadcast';
  broadcastDate?: string;
}

export interface AppData {
  properties: Property[];
  tenants: Tenant[];
  reminders: Reminder[];
  maintenanceRequests: MaintenanceRequest[];
  vacancies: Vacancy[];
}
