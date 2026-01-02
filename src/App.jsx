import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Stethoscope, Printer, Plus, LogOut, Trash2, 
  Search, X, CheckCircle2, Camera, Settings, CreditCard, 
  Home, ScanLine, Menu
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode'; 
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Firebase Config
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

// UI Components
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = "button", disabled }) => {
  const styles = {
    primary: "bg-cyan-600 text-white active:bg-cyan-700",
    outline: "bg-white text-slate-700 border border-slate-200 active:bg-slate-50",
    ghost: "bg-transparent text-slate-500 active:bg-slate-100"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50 ${styles[variant]} ${className}`}>
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" {...props} />
  </div>
);

// --- TAM EKRAN MOBİL KAMERA ---
const MobileScanner = ({ onScan, onClose }) => {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
    
    html5QrCode.start({ facingMode: "environment" }, config, 
      (decodedText) => {
        html5QrCode.stop().then(() => onScan(decodedText));
      },
      () => {}
    ).catch(err => console.error("Kamera Hatası:", err));

    return () => { if(html5QrCode.isScanning) html5QrCode.stop(); };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="relative flex-1 bg-black">
        <div id="reader" className="w-full h-full object-cover"></div>
        {/* Hedef Çerçevesi */}
        <div className="absolute inset-0 border-[60px] border-black/60 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-cyan-500 rounded-3xl relative animate-pulse">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 text-4xl opacity-50">+</div>
          </div>
        </div>
      </div>
      <div className="bg-black p-6 pb-12 flex justify-between items-center">
        <p className="text-white font-bold text-center flex-1">QR Kodu Ortala</p>
        <button onClick={onClose} className="bg-white/20 p-4 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [assets, setAssets] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth State
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setView(u ? 'dashboard' : 'landing');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/assets`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const handleAuth = async (isReg) => {
    try {
      if (isReg) await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) { alert(e.message); }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await addDoc(collection(db, `users/${user.uid}/assets`), {
      name: fd.get('name'), brand: fd.get('brand'), serial: fd.get('serial'),
      nextService: fd.get('nextService'), status: 'active', createdAt: serverTimestamp()
    });
    setIsAddModalOpen(false);
  };

  const handleScan = (txt) => {
    setIsScannerOpen(false);
    const found = assets.find(a => txt.includes(a.id));
    alert(found ? `CİHAZ BULUNDU:\n${found.name}` : 'Cihaz sistemde kayıtlı değil.');
  };

  // --- RENDER ---

  if (!user) {
    // Landing & Login (Mobile Optimized)
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-cyan-50 rounded-3xl flex items-center justify-center mx-auto text-cyan-600">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">MediLog Mobil</h1>
          
          {view === 'landing' ? (
            <div className="space-y-4">
              <Button onClick={() => setView('login')} className="w-full py-4 text-lg">Giriş Yap</Button>
              <Button variant="outline" className="w-full py-4 text-lg">Kayıt Ol</Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <Input placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} />
              <Input placeholder="Şifre" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
              <Button onClick={() => handleAuth(false)} className="w-full py-4">Giriş</Button>
              <button onClick={() => setView('landing')} className="text-sm text-slate-400 font-bold">Geri Dön</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // APP INTERFACE (Native Feel)
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-cyan-100">
      {isScannerOpen && <MobileScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Top Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-40">
        <h1 className="text-xl font-black text-slate-900">Cihazlar ({assets.length})</h1>
        <button onClick={() => signOut(auth)} className="bg-slate-100 p-2 rounded-full text-slate-600">
          <LogOut size={20}/>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            className="w-full p-2 outline-none font-bold text-slate-700 placeholder:text-slate-300" 
            placeholder="Cihaz Ara..." 
            value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
          />
        </div>

        {/* Asset List */}
        {assets.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>Listeniz boş.</p>
            <p className="text-xs mt-2">Sağ alttaki (+) butonu ile ekleyin.</p>
          </div>
        ) : (
          assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())).map(asset => (
            <div key={asset.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{asset.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase">{asset.brand}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">AKTİF</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => deleteDoc(doc(db, `users/${user.uid}/assets`, asset.id))} className="flex-1 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">Sil</button>
                <button className="flex-1 py-2 bg-cyan-50 rounded-lg text-xs font-bold text-cyan-600">Detay</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button (FAB) - SCANNER */}
      <div className="fixed bottom-24 right-6 z-40">
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Camera size={28} />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20">
        <button onClick={() => setView('dashboard')} className="flex flex-col items-center gap-1 text-cyan-600">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-black">Ana Sayfa</span>
        </button>
        
        {/* Orta Ekleme Butonu */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-cyan-600 text-white p-4 rounded-full -mt-12 shadow-xl border-4 border-slate-50"
        >
          <Plus size={32} />
        </button>

        <button onClick={() => window.print()} className="flex flex-col items-center gap-1 text-slate-400">
          <Printer size={24} />
          <span className="text-[10px] font-black">Yazdır</span>
        </button>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Yeni Cihaz</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <Input name="name" placeholder="Cihaz Adı" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="brand" placeholder="Marka" required />
                <Input name="serial" placeholder="Seri No" required />
              </div>
              <Input name="nextService" type="date" required />
              <Button type="submit" className="w-full py-4 mt-2">Kaydet</Button>
            </form>
          </div>
        </div>
      )}
      
      {/* Safe Area for iPhone Home Indicator */}
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        body { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
