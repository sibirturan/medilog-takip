import { QrCode } from 'lucide-react'
import { useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function ScanQRButton({ onScanSuccess }) {
  const [scanning, setScanning] = useState(false)

  const startScanning = () => {
    setScanning(true)
    
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      })
      
      scanner.render(
        (decodedText) => {
          scanner.clear()
          setScanning(false)
          onScanSuccess(decodedText)
        },
        (error) => {
          console.warn('QR Scan error:', error)
        }
      )
    }, 100)
  }

  const stopScanning = () => {
    setScanning(false)
    const element = document.getElementById('qr-reader')
    if (element) element.innerHTML = ''
  }

  return (
    <>
      <button
        onClick={scanning ? stopScanning : startScanning}
        className={`flex items-center gap-2 px-4 py-2 ${
          scanning ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
        } text-white rounded-lg transition-all shadow-sm hover:shadow-md`}
      >
        <QrCode size={20} />
        <span className="font-medium">{scanning ? 'Stop Scan' : 'Scan QR'}</span>
      </button>

      {scanning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Scan QR Code</h3>
            <div id="qr-reader" className="mb-4"></div>
            <button
              onClick={stopScanning}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
