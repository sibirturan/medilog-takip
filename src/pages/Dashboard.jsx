import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import DeviceForm from '../components/DeviceForm'
import ExportButton from '../components/ExportButton'
import PrintButton from '../components/PrintButton'
import ScanQRButton from '../components/ScanQRButton'

export default function Dashboard() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'devices'))
      const devicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDevices(devicesData)
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDoc(doc(db, 'devices', id))
        setDevices(devices.filter(device => device.id !== id))
      } catch (error) {
        console.error('Error deleting device:', error)
      }
    }
  }

  const handleEdit = (device) => {
    setEditingDevice(device)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDevice(null)
    fetchDevices()
  }

  const handleQRScan = (serialNumber) => {
    const device = devices.find(d => d.serialNumber === serialNumber)
    if (device) {
      handleEdit(device)
    } else {
      alert(`Device with serial number ${serialNumber} not found!`)
    }
  }

  const filteredDevices = devices.filter(device =>
    device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMaintenanceStatus = (nextMaintenance) => {
    if (!nextMaintenance) return 'unknown'
    const today = new Date()
    const maintenanceDate = new Date(nextMaintenance)
    const diffDays = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 7) return 'urgent'
    if (diffDays <= 30) return 'soon'
    return 'ok'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Medical Device Management</h1>
          <p className="text-blue-200">Track and manage your medical equipment</p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <ScanQRButton onScanSuccess={handleQRScan} />
              <PrintButton devices={filteredDevices} />
              <ExportButton devices={filteredDevices} />
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                <span className="font-medium">Add Device</span>
              </button>
            </div>
          </div>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => {
            const maintenanceStatus = getMaintenanceStatus(device.nextMaintenance)
            
            return (
              <div
                key={device.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/20 hover:border-blue-400"
              >
                {/* Status Badge */}
                {maintenanceStatus === 'overdue' && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-500/20 border border-red-500 rounded-lg">
                    <AlertCircle size={16} className="text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Maintenance Overdue</span>
                  </div>
                )}
                {maintenanceStatus === 'urgent' && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-orange-500/20 border border-orange-500 rounded-lg">
                    <AlertCircle size={16} className="text-orange-400" />
                    <span className="text-orange-400 text-sm font-medium">Maintenance Due Soon</span>
                  </div>
                )}

                {/* Device Info */}
                <h3 className="text-xl font-bold text-white mb-3">{device.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Serial:</span>
                    <span className="text-white font-medium">{device.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Category:</span>
                    <span className="text-blue-300">{device.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Location:</span>
                    <span className="text-white">{device.location}</span>
                  </div>
                  {device.nextMaintenance && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Next Maintenance:</span>
                      <span className={`font-medium ${
                        maintenanceStatus === 'overdue' ? 'text-red-400' :
                        maintenanceStatus === 'urgent' ? 'text-orange-400' :
                        maintenanceStatus === 'soon' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {device.nextMaintenance}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-white/20">
                  <button
                    onClick={() => handleEdit(device)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {searchTerm ? 'No devices found matching your search' : 'No devices yet. Add your first device!'}
            </div>
          </div>
        )}

        {/* Device Form Modal */}
        {showForm && (
          <DeviceForm
            device={editingDevice}
            onClose={handleFormClose}
          />
        )}
      </div>
    </div>
  )
}
