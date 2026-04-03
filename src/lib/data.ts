import { AppData } from '@/types';

// fs only available on server
let fs: typeof import('fs') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fs = require('fs');
} catch {
  fs = null;
}

const DATA_PATH = '/tmp/landlord-data.json';

const initialData: AppData = {
  properties: [
    {
      id: '1',
      address: '123 Main Street, Unit A',
      unit: 'A',
      bedrooms: 2,
      bathrooms: 1,
      rentAmount: 1200,
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      address: '456 Oak Avenue',
      unit: '1',
      bedrooms: 3,
      bathrooms: 2,
      rentAmount: 1800,
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: '3',
      address: '789 Pine Road',
      unit: 'B',
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 950,
      createdAt: '2024-03-01T00:00:00Z'
    }
  ],
  tenants: [
    {
      id: '1',
      name: 'John Smith',
      phone: '+15551234567',
      email: 'john.smith@email.com',
      propertyId: '1',
      leaseStart: '2024-01-15',
      leaseEnd: '2025-01-14',
      rentAmount: 1200,
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '+15559876543',
      email: 'sarah.j@email.com',
      propertyId: '2',
      leaseStart: '2024-02-01',
      leaseEnd: '2025-01-31',
      rentAmount: 1800,
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Mike Davis',
      phone: '+15555551234',
      propertyId: '3',
      leaseStart: '2024-03-01',
      leaseEnd: '2025-02-28',
      rentAmount: 950,
      createdAt: '2024-03-01T00:00:00Z'
    }
  ],
  reminders: [
    { id: '1', tenantId: '1', type: 'before', days: 3, enabled: true, createdAt: '2024-01-15T00:00:00Z' },
    { id: '2', tenantId: '1', type: 'due', days: 0, enabled: true, createdAt: '2024-01-15T00:00:00Z' },
    { id: '3', tenantId: '1', type: 'after', days: 1, enabled: true, createdAt: '2024-01-15T00:00:00Z' },
    { id: '4', tenantId: '2', type: 'before', days: 3, enabled: true, createdAt: '2024-02-01T00:00:00Z' },
    { id: '5', tenantId: '2', type: 'due', days: 0, enabled: false, createdAt: '2024-02-01T00:00:00Z' },
    { id: '6', tenantId: '3', type: 'before', days: 3, enabled: true, createdAt: '2024-03-01T00:00:00Z' }
  ],
  maintenanceRequests: [
    {
      id: '1',
      propertyId: '1',
      tenantId: '1',
      description: 'Kitchen sink leaking heavily under the cabinet',
      urgency: 'urgent',
      status: 'pending',
      createdAt: '2024-06-10T10:30:00Z'
    },
    {
      id: '2',
      propertyId: '2',
      tenantId: '2',
      description: 'Air conditioning not cooling - making loud noise',
      urgency: 'urgent',
      status: 'in_progress',
      createdAt: '2024-06-08T14:00:00Z'
    },
    {
      id: '3',
      propertyId: '3',
      tenantId: '3',
      description: 'Bedroom closet door handle broken',
      urgency: 'normal',
      status: 'pending',
      createdAt: '2024-06-12T09:00:00Z'
    },
    {
      id: '4',
      propertyId: '1',
      tenantId: '1',
      description: 'Water heater not working - no hot water at all',
      urgency: 'emergency',
      status: 'pending',
      createdAt: '2024-06-13T07:15:00Z'
    }
  ],
  vacancies: [
    {
      id: '1',
      propertyId: '3',
      availableDate: '2025-03-01',
      rentAmount: 950,
      description: 'Cozy 1BR with updated kitchen and laundry in-unit',
      broadcastStatus: 'not_broadcast'
    }
  ]
};

// In-memory store for MVP
let memoryStore: AppData = { ...initialData };

export async function loadData(): Promise<AppData> {
  return { ...memoryStore };
}

export async function saveData(data: AppData): Promise<void> {
  memoryStore = { ...data };
  if (fs) {
    try {
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch {
      // Ignore file write errors in client
    }
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
