import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ExportButton({ devices }) {
  
  const exportToExcel = () => {
    if (!devices || devices.length === 0) {
      alert('No devices to export!')
      return
    }

    const excelData = devices.map(device => ({
      'Device Name': device.name || 'N/A',
      'Serial Number': device.serialNumber || 'N/A',
      'Category': device.category || 'N/A',
      'Manufacturer': device.manufacturer || 'N/A',
      'Model': device.model || 'N/A',
      'Location': device.location || 'N/A',
      'Purchase Date': device.purchaseDate || 'N/A',
      'Last Maintenance': device.lastMaintenance || 'N/A',
      'Next Maintenance': device.nextMaintenance || 'N/A',
      'Status': device.status || 'Active'
    }))
    
    const ws = XLSX.utils.json_to_sheet(excelData)
    ws['!cols'] = [
      { wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
      { wch: 18 }, { wch: 12 }
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Devices')
    
    const fileName = `medilog-devices-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }
  
  return (
    <button
      onClick={exportToExcel}
      disabled={!devices || devices.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileSpreadsheet size={20} />
      <span className="font-medium">Export Excel</span>
    </button>
  )
}
