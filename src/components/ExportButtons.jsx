import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function ExportButtons({ devices }) {
  
  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Başlık
    doc.setFontSize(18)
    doc.text('Medical Device List', 14, 22)
    
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
    
    // Tablo verisi hazırla
    const tableData = devices.map(device => [
      device.name || 'N/A',
      device.serialNumber || 'N/A',
      device.location || 'N/A',
      device.lastMaintenance || 'N/A',
      device.nextMaintenance || 'N/A',
      device.status || 'Active'
    ])
    
    // Tablo oluştur
    doc.autoTable({
      head: [['Device Name', 'Serial Number', 'Location', 'Last Maintenance', 'Next Maintenance', 'Status']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    // İndir
    doc.save(`devices-${Date.now()}.pdf`)
  }
  
  // Excel Export
  const exportToExcel = () => {
    // Veriyi düzenle
    const excelData = devices.map(device => ({
      'Device Name': device.name || 'N/A',
      'Serial Number': device.serialNumber || 'N/A',
      'Category': device.category || 'N/A',
      'Location': device.location || 'N/A',
      'Last Maintenance': device.lastMaintenance || 'N/A',
      'Next Maintenance': device.nextMaintenance || 'N/A',
      'Status': device.status || 'Active',
      'Notes': device.notes || ''
    }))
    
    // Worksheet oluştur
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // Kolon genişlikleri
    ws['!cols'] = [
      { wch: 25 }, // Device Name
      { wch: 15 }, // Serial Number
      { wch: 15 }, // Category
      { wch: 20 }, // Location
      { wch: 15 }, // Last Maintenance
      { wch: 15 }, // Next Maintenance
      { wch: 10 }, // Status
      { wch: 30 }  // Notes
    ]
    
    // Workbook oluştur
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Devices')
    
    // İndir
    XLSX.writeFile(wb, `devices-${Date.now()}.xlsx`)
  }
  
  return (
    <div className="flex gap-3">
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        <FileText size={18} />
        Export PDF
      </button>
      
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        <FileSpreadsheet size={18} />
        Export Excel
      </button>
    </div>
  )
}
