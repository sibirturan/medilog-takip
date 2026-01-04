// src/types/index.ts
export interface MaintenanceHistory {
  id: string;
  date: string;
  type: 'Routine' | 'Repair' | 'Calibration' | 'Cleaning';
  description: string;
  technician?: string;
  cost?: number;
}

export interface DeviceDocument {
  id: string;
  name: string;
  url: string;
  type: 'manual' | 'certificate' | 'invoice' | 'other';
  uploadedAt: string;
  size: number;
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  serialNumber: string;
  nextServiceDate: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Broken';
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  
  // YENİ ALANLAR
  serviceProvider?: string;
  servicePhone?: string;
  serviceEmail?: string;
  notes?: string;
  documents?: DeviceDocument[];
  maintenanceHistory?: MaintenanceHistory[];
}
