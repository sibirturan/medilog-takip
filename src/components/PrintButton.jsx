import { Printer } from 'lucide-react'

export default function PrintButton({ devices }) {
  
  const handlePrint = () => {
    if (!devices || devices.length === 0) {
      alert('No devices to print!')
      return
    }

    const printWindow = window.open('', '_blank')
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Devices Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #333;
            }
            h1 { 
              color: #1e40af; 
              border-bottom: 3px solid #1e40af;
              padding-bottom: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th { 
              background: #1e40af; 
              color: white; 
              padding: 12px;
              text-align: left;
            }
            td { 
              border: 1px solid #ddd; 
              padding: 10px;
            }
            tr:nth-child(even) { 
              background: #f9fafb; 
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .date {
              color: #666;
              font-size: 14px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Devices Report</h1>
            <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Serial Number</th>
                <th>Category</th>
                <th>Location</th>
                <th>Next Maintenance</th>
              </tr>
            </thead>
            <tbody>
              ${devices.map(device => `
                <tr>
                  <td>${device.name || 'N/A'}</td>
                  <td>${device.serialNumber || 'N/A'}</td>
                  <td>${device.category || 'N/A'}</td>
                  <td>${device.location || 'N/A'}</td>
                  <td>${device.nextMaintenance || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
  
  return (
    <button
      onClick={handlePrint}
      disabled={!devices || devices.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Printer size={20} />
      <span className="font-medium">Print</span>
    </button>
  )
}
