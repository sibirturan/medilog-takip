// src/types/index.ts

export interface MaintenanceRecord {
  id: string;
  date: string;
  description: string;
  technician?: string;
  cost?: number;
}

export interface DeviceDocument {
  id: string;
  name: string;
  url: string;
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
  
  // Yeni alanlar
  serviceProvider?: string;
  servicePhone?: string;
  serviceEmail?: string;
  notes?: string;
  documents?: DeviceDocument[];
  maintenanceHistory?: MaintenanceRecord[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

