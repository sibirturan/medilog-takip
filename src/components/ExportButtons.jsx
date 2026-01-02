import { FileText, FileSpreadsheet } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function ExportButtons({ devices }) {
  
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(24)
    doc.setTextColor(59, 130, 246)
    doc.text('MediLog', 14, 20)
    
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Medical Device List', 14, 32)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const now = new Date()
    doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 14, 40)
    doc.text(`Total Devices: ${devices.length}`, 14, 46)
    
    const tableData = devices.map(device => [
      device.name || 'N/A',
      device.serialNumber || 'N/A',
      device.category || 'N/A',
      device.location || 'N/A',
      device.nextMaintenance || 'N/A',
      device.status || 'Active'
    ])
    
    doc.autoTable({
      head: [['Device Name', 'Serial No.', 'Category', 'Location', 'Next Maintenance', 'Status']],
      body: tableData,
      startY: 52,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    })
    
    doc.save(`medilog-devices-${Date.now()}.pdf`)
  }
  
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
    return <div className="text-gray-400 text-sm">No devices to export</div>
  }
  
  return (
    <div className="flex gap-3">
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
      >
        <FileText size={18} />
        <span>Export PDF</span>
      </button>
      
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
      >
        <FileSpreadsheet size={18} />
        <span>Export Excel</span>
      </button>
    </div>
  )
}
