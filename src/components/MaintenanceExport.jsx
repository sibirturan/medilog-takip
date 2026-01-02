import { FileText, FileSpreadsheet } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function MaintenanceExport({ maintenanceHistory, deviceName }) {
  
  // Bakım Geçmişi PDF
  const exportMaintenancePDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text(`Maintenance History: ${deviceName}`, 14, 22)
    
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
    
    const tableData = maintenanceHistory.map(record => [
      record.date || 'N/A',
      record.type || 'N/A',
      record.technician || 'N/A',
      record.description || 'N/A',
      record.cost ? `$${record.cost}` : 'N/A'
    ])
    
    doc.autoTable({
      head: [['Date', 'Type', 'Technician', 'Description', 'Cost']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save(`maintenance-${deviceName}-${Date.now()}.pdf`)
  }
  
  // Bakım Geçmişi Excel
  const exportMaintenanceExcel = () => {
    const excelData = maintenanceHistory.map(record => ({
      'Date': record.date || 'N/A',
      'Type': record.type || 'N/A',
      'Technician': record.technician || 'N/A',
      'Description': record.description || 'N/A',
      'Cost': record.cost || 0,
      'Parts Replaced': record.partsReplaced || '',
      'Next Due': record.nextDue || ''
    }))
    
    const ws = XLSX.utils.json_to_sheet(excelData)
    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 40 },
      { wch: 10 },
      { wch: 30 },
      { wch: 12 }
    ]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance History')
    
    XLSX.writeFile(wb, `maintenance-${deviceName}-${Date.now()}.xlsx`)
  }
  
  return (
    <div className="flex gap-2">
      <button
        onClick={exportMaintenancePDF}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        <FileText size={16} />
        PDF
      </button>
      
      <button
        onClick={exportMaintenanceExcel}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
    </div>
  )
}
