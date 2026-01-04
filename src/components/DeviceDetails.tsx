// src/components/DeviceDetails.tsx
import React from 'react';
import { Device } from '../types';

interface DeviceDetailsProps {
  device: Device;
  onClose: () => void;
}

export const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, onClose }) => {
  
  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
            <p className="text-gray-600">{device.brand} • {device.serialNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.status)}`}>
              {device.status}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Next Service Date */}
          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded">
            <p className="text-sm text-gray-600">Next Service Date</p>
            <p className="text-xl font-bold text-gray-900">
              {new Date(device.nextServiceDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Quick Actions */}
          {(device.servicePhone || device.serviceEmail) && (
            <div className="grid grid-cols-2 gap-3">
              {device.servicePhone && (
                <a
                  href={`tel:${device.servicePhone}`}
                  className="flex items-center justify-center space-x-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                >
                  <span>📞</span>
                  <span>Call Service</span>
                </a>
              )}
              {device.serviceEmail && (
                <a
                  href={`mailto:${device.serviceEmail}`}
                  className="flex items-center justify-center space-x-2 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-medium"
                >
                  <span>📧</span>
                  <span>Email Service</span>
                </a>
              )}
            </div>
          )}

          {/* Service Provider Info */}
          {device.serviceProvider && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">🔧 Service Provider</h3>
              <p className="text-gray-700">{device.serviceProvider}</p>
              {device.servicePhone && <p className="text-sm text-gray-600 mt-1">📞 {device.servicePhone}</p>}
              {device.serviceEmail && <p className="text-sm text-gray-600">📧 {device.serviceEmail}</p>}
            </div>
          )}

          {/* Documents */}
          {device.documents && device.documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📄 Documents</h3>
              <div className="space-y-2">
                {device.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {doc.type === 'manual' ? '📖' : 
                         doc.type === 'certificate' ? '🎓' :
                         doc.type === 'invoice' ? '🧾' : '📄'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <span className="text-cyan-600 font-bold">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance History */}
          {device.maintenanceHistory && device.maintenanceHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📝 Maintenance History</h3>
              <div className="space-y-3">
                {device.maintenanceHistory.slice(0, 5).map((record) => (
                  <div key={record.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-cyan-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{record.type}</span>
                          <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                            {new Date(record.date).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{record.description}</p>
                        {record.technician && (
                          <p className="text-xs text-gray-500 mt-1">👨‍🔧 {record.technician}</p>
                        )}
                      </div>
                      {record.cost && (
                        <span className="text-sm font-medium text-gray-900">{record.cost}₺</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {device.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📝 Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {device.notes}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
