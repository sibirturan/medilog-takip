import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, LayoutDashboard, Stethoscope, Settings, QrCode, Wrench, History, 
  LogOut, AlertTriangle, CheckCircle2, Clock, ChevronRight, Search, X, 
  User, CreditCard, Save, TrendingUp, DollarSign, Activity, Zap, Sparkles,
  Smartphone, Check, ArrowRight, PlayCircle, Camera, Printer, Mail
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, onSnapshot, query, orderBy, getDoc, setDoc, where } from 'firebase/firestore';

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyCU5rVA6j88gTtQEG5i3hshC3A3SBy5nu0",
  authDomain: "medilog-d0de9.firebaseapp.com",
  projectId: "medilog-d0de9",
  storageBucket: "medilog-d0de9.firebasestorage.app",
  messagingSenderId: "1030786694118",
  appId: "1:1030786694118:web:6a23b10887dad87d963427"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'medilog-v2-pro';

// --- QR Tarayıcı Bileşeni ---
const QRScannerOverlay = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.onload = () => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      });
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    };
  }, []);

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const code = window.jsQR?.(ctx.getImageData(0,0,canvas.width,canvas.height).data, canvas.width, canvas.height);
      if (code) { onScan(code.data); return; }
    }
    requestAnimationFrame(tick);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center p-6 backdrop-blur-md">
      <button onClick={onClose} className="absolute top-8 right-8 text-white"><X size={40} /></button>
      <div className="relative w-full max-w-sm aspect-square border-4 border-cyan-500 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20">
        <video ref={videoRef} className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <p className="mt-8 text-white font-black uppercase tracking-widest animate-pulse">Scanning QR Code...</p>
    </div>
  );
};

// --- ANA UYGULAMA MANTĞI ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // landing, dashboard, public_asset
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // URL kontrolü (/asset/ID şeklinde mi geldik?)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/asset/')) {
      const assetId = path.split('/').pop();
      fetchPublicAsset(assetId);
    }
  }, []);

  const fetchPublicAsset = async (id) => {
    // Burada tüm klinik verilerinden bu ID'li cihazı bulma mantığı olacak
    setView('public_asset');
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) { setUser(u); setView('dashboard'); }
    });
  }, []);

  if (view === 'landing') return <Landing onStart={() => setView('auth')} onDemo={() => {setIsDemo(true); setView('dashboard');}} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {isScannerOpen && <QRScannerOverlay onScan={(data) => { alert("Scanned: " + data); setIsScannerOpen(false); }} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Dashboard & Sidebar yapısı buraya gelecek... */}
      <div className="p-10">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3 text-cyan-600">
             <Stethoscope size={32} />
             <span className="text-2xl font-black tracking-tighter uppercase">MEDILOG PRO</span>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setIsScannerOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2">
                <Camera size={18} /> SCAN QR
             </button>
             <button className="bg-cyan-600 text-white px-6 py-3 rounded-2xl font-black text-xs">ADD DEVICE</button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="p-8 border-l-8 border-cyan-500">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance Due</p>
              <h2 className="text-4xl font-black mt-2">3 Devices</h2>
           </Card>
           <Card className="p-8 border-l-8 border-emerald-500">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</p>
              <h2 className="text-4xl font-black mt-2">Optimal</h2>
           </Card>
           <Card className="p-8 border-l-8 border-indigo-500">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Labels Printed</p>
              <h2 className="text-4xl font-black mt-2">14/20</h2>
           </Card>
        </section>
      </div>
    </div>
  );
}

// Yardımcı Bileşenler (Card, Landing vb.)
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const Landing = ({ onStart, onDemo }) => (
  <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
    <Badge>2026 Enterprise Edition</Badge>
    <h1 className="text-6xl font-black tracking-tighter mt-6">Simple Equipment Tracking.</h1>
    <p className="text-slate-500 max-w-xl mt-6 font-medium">Dental, Vet and Private Clinics' best friend for maintenance and compliance.</p>
    <div className="flex gap-4 mt-10">
      <button onClick={onStart} className="bg-cyan-600 text-white px-10 py-5 rounded-2xl font-black shadow-xl">Start 14-Day Trial</button>
      <button onClick={onDemo} className="bg-slate-100 text-slate-600 px-10 py-5 rounded-2xl font-black">Try Demo</button>
    </div>
  </div>
);

const Badge = ({ children }) => (
  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-100">{children}</span>
);
