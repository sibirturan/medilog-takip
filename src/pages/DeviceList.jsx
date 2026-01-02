import { useState, useEffect } from 'react'
import ExportButtons from '../components/ExportButtons'

export default function DeviceList() {
  const [devices, setDevices] = useState([])
  
  // Firebase'den cihazları çek
  useEffect(() => {
    // Buraya Firebase fetch kodu gelecek
    // Şimdilik örnek veri:
    setDevices([
      {
        id: '1',
        name: 'X-Ray Machine',
        serialNumber: 'XR-2024-001',
        category: 'Imaging',
        location: 'Radiology Dept',
        lastMaintenance: '2024-12-01',
        nextMaintenance: '2025-03-01',
        status: 'Active'
      },
      {
        id: '2',
        name: 'Ultrasound Scanner',
        serialNumber: 'US-2024-002',
        category: 'Imaging',
        location: 'Ultrasound Room',
        lastMaintenance: '2024-11-15',
        nextMaintenance: '2025-02-15',
        status: 'Active'
      }
    ])
  }, [])
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Device List</h1>
        
        {/* Export Butonları */}
        <ExportButtons devices={devices} />
      </div>
      
      {/* Cihaz Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Maintenance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {devices.map(device => (
              <tr key={device.id}>
                <td className="px-6 py-4">{device.name}</td>
                <td className="px-6 py-4">{device.serialNumber}</td>
                <td className="px-6 py-4">{device.location}</td>
                <td className="px-6 py-4">{device.nextMaintenance}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {device.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
