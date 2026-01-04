// src/components/DeviceForm.tsx
import React, { useState } from 'react';
import { Device, DeviceDocument } from '../types';

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
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {device ? 'Edit Device' : 'Add New Device'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* DEVICE NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DEVICE NAME
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Tansiyon Aletleri"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* BRAND & SERIAL NUMBER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BRAND
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., TC"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SERIAL NUMBER
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g., 121314"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* SERVICE PROVIDER & PHONE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 SERVICE PROVIDER
              </label>
              <input
                type="text"
                value={formData.serviceProvider}
                onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                placeholder="e.g., Medikal Servis A.Ş."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📞 SERVICE PHONE
              </label>
              <input
                type="tel"
                value={formData.servicePhone}
                onChange={(e) => setFormData({ ...formData, servicePhone: e.target.value })}
                placeholder="0212 XXX XX XX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* SERVICE EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📧 SERVICE EMAIL
            </label>
            <input
              type="email"
              value={formData.serviceEmail}
              onChange={(e) => setFormData({ ...formData, serviceEmail: e.target.value })}
              placeholder="servis@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* NEXT SERVICE DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NEXT SERVICE DATE
            </label>
            <input
              type="date"
              required
              value={formData.nextServiceDate}
              onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              STATUS
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Device['status'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Broken">Broken</option>
            </select>
          </div>

          {/* FILE UPLOAD */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📄 Documents & Manuals
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-4xl">📁</div>
                  <div className="text-sm text-gray-600">
                    <span className="text-cyan-600 font-medium">Upload files</span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG up to 10MB</p>
                </div>
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 NOTES
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this device..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              e.g., "Filter changed on last maintenance", "Needs special calibration tool"
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-medium"
            >
              {device ? 'Update' : 'Create'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
