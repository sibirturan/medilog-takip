// src/components/DeviceForm.tsx
import React, { useState } from 'react';
import { Device, DeviceDocument, MaintenanceRecord } from '../types';
import { uploadMultipleFiles } from '../services/storageService';

interface DeviceFormProps {
  device?: Device;
  onSave: (device: Partial<Device>) => void;
  onCancel: () => void;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ device, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Device>>({
    name: device?.name || '',
    brand: device?.brand || '',
    serialNumber: device?.serialNumber || '',
    nextServiceDate: device?.nextServiceDate || '',
    status: device?.status || 'Active',
    serviceProvider: device?.serviceProvider || '',
    servicePhone: device?.servicePhone || '',
    serviceEmail: device?.serviceEmail || '',
    notes: device?.notes || '',
    documents: device?.documents || [],
    maintenanceHistory: device?.maintenanceHistory || [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Dosya seçme
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let uploadedDocuments = formData.documents || [];

      // Dosya yükleme
      if (selectedFiles.length > 0) {
        const results = await uploadMultipleFiles(selectedFiles);
        const newDocs: DeviceDocument[] = results.map(result => ({
          id: crypto.randomUUID(),
          name: result.name,
          url: result.url,
          uploadedAt: new Date().toISOString(),
          size: result.size
        }));
        uploadedDocuments = [...uploadedDocuments, ...newDocs];
      }

      onSave({
        ...formData,
        documents: uploadedDocuments
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  // Bakım kaydı ekleme
  const addMaintenanceRecord = () => {
    const newRecord: MaintenanceRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      technician: '',
      cost: 0
    };
    setFormData({
      ...formData,
      maintenanceHistory: [...(formData.maintenanceHistory || []), newRecord]
    });
  };

  // Bakım kaydı güncelleme
  const updateMaintenanceRecord = (id: string, field: keyof MaintenanceRecord, value: any) => {
    setFormData({
      ...formData,
      maintenanceHistory: formData.maintenanceHistory?.map(record =>
        record.id === id ? { ...record, [field]: value } : record
      )
    });
  };

  // Bakım kaydı silme
  const deleteMaintenanceRecord = (id: string) => {
    setFormData({
      ...formData,
      maintenanceHistory: formData.maintenanceHistory?.filter(record => record.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Device</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* DEVICE NAME */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">DEVICE NAME</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* BRAND & SERIAL NUMBER */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">BRAND</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SERIAL NUMBER</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* NEXT SERVICE DATE */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">NEXT SERVICE DATE</label>
            <input
              type="date"
              required
              value={formData.nextServiceDate}
              onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">STATUS</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Device['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Broken">Broken</option>
            </select>
          </div>

          {/* ========== YENİ ALANLAR BAŞLANGIÇ ========== */}

          {/* 1. SERVİS FİRMASI BİLGİLERİ */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Service Provider Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SERVICE PROVIDER</label>
                <input
                  type="text"
                  value={formData.serviceProvider}
                  onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                  placeholder="Company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">PHONE</label>
                  <input
                    type="tel"
                    value={formData.servicePhone}
                    onChange={(e) => setFormData({ ...formData, servicePhone: e.target.value })}
                    placeholder="0212 XXX XX XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">EMAIL</label>
                  <input
                    type="email"
                    value={formData.serviceEmail}
                    onChange={(e) => setFormData({ ...formData, serviceEmail: e.target.value })}
                    placeholder="service@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. DOSYA YÜKLEME */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Documents</h3>
            
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            
            {selectedFiles.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                {selectedFiles.length} file(s) selected
              </div>
            )}

            {formData.documents && formData.documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.documents.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm">{doc.name}</span>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 text-sm">View</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. NOTLAR */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* 4. BAKIM GEÇMİŞİ */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-700">Maintenance History</h3>
              <button
                type="button"
                onClick={addMaintenanceRecord}
                className="px-3 py-1 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600"
              >
                + Add
              </button>
            </div>

            <div className="space-y-3">
              {formData.maintenanceHistory?.map(record => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={record.date}
                      onChange={(e) => updateMaintenanceRecord(record.id, 'date', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={record.technician || ''}
                      onChange={(e) => updateMaintenanceRecord(record.id, 'technician', e.target.value)}
                      placeholder="Technician"
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <textarea
                    value={record.description}
                    onChange={(e) => updateMaintenanceRecord(record.id, 'description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <input
                      type="number"
                      value={record.cost || ''}
                      onChange={(e) => updateMaintenanceRecord(record.id, 'cost', parseFloat(e.target.value))}
                      placeholder="Cost"
                      className="px-2 py-1 border border-gray-300 rounded text-sm w-32"
                    />
                    <button
                      type="button"
                      onClick={() => deleteMaintenanceRecord(record.id)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== YENİ ALANLAR BİTİŞ ========== */}

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={uploading}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Update'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
