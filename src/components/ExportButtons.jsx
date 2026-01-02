import { FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ExportButton({ devices }) {
  
  const exportToExcel = () => {
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
    XLSX.writeFile(wb, `medilog-devices-${Date.now()}.xlsx`)
  }
  
  if (!devices || devices.length === 0) {
    return null
  }
  
  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
    >
      <FileSpreadsheet size={20} />
      <span className="font-medium">Export to Excel</span>
    </button>
  )
}
