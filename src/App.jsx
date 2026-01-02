import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, LayoutDashboard, Stethoscope, Settings, QrCode, Wrench, History, 
  LogOut, MoreVertical, AlertTriangle, CheckCircle2, Clock, ChevronRight, 
  Search, X, User, CreditCard, Save, TrendingUp, DollarSign, Activity, Zap, Sparkles
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, onSnapshot, 
  query, orderBy, getDoc, setDoc 
} from 'firebase/firestore';

// --- Firebase Configuration ---
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
const appId = 'medilog-live-v1';

// --- UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    premium: "bg-indigo-600 text-white shadow-lg",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

const QRCodeImage = ({ data, size = 150 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  return (
    <div className="bg-white p-3 rounded-2xl inline-block border border-slate-100 shadow-inner">
      <img src={qrUrl} alt="QR Code" className="block rounded-lg mx-auto" style={{ width: size, height: size }} />
    </div>
  );
};

// --- QR Scanner Component ---
const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.onload = startCamera;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) { console.error("Camera error", err); }
  };

  const tick = () => {
    if (videoRef.current?.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR?.(imageData.data, imageData.width, imageData.height);
      if (code) {
        const assetId = code.data.split('/').pop();
        onScan(assetId);
        return;
      }
    }
    requestAnimationFrame(tick);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/98 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-lg">
      <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={40} /></button>
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-white/10">
        <video ref={videoRef} className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 border-[60px] border-black/40">
           <div className="h-full w-full border-2 border-blue-500 rounded-3xl animate-pulse"></div>
        </div>
      </div>
      <div className="mt-12 text-center text-white">
        <h3 className="text-xl font-black uppercase tracking-widest mb-2">Identify Asset</h3>
        <p className="text-slate-400 text-sm font-medium px-8 italic">Scan the device's MediLog QR tag.</p>
      </div>
    </div>
  );
};

// --- Auth Page ---
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'settings', 'clinicInfo'), {
          name: "My Medical Center",
          email: email,
          subscription: "free",
          trialStartDate: new Date().toISOString()
        });
      }
    } catch (err) {
      setError("Authentication failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl mb-6"><Stethoscope size={32} /></div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">MediLog</h1>
          <p className="text-slate-500 font-medium mt-2">Enterprise Medical Asset Hub</p>
        </div>
        <Card className="p-10 border-none shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" />
            </div>
            {error && <div className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isLogin ? 'Sign In' : 'Register Account'}
            </button>
          </form>
          <div className="mt-8 text-center border-t pt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest">
              {isLogin ? "Join MediLog Network" : "Access Existing Portal"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main Application ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [assets, setAssets] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clinicInfo, setClinicInfo] = useState({ name: "New Clinic", subscription: "free", trialStartDate: new Date().toISOString() });

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const assetsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'assets');
    const unsubAssets = onSnapshot(query(assetsRef, orderBy('createdAt', 'desc')), (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const clinicRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'clinicInfo');
    getDoc(clinicRef).then(snap => snap.exists() && setClinicInfo(snap.data()));
    return () => unsubAssets();
  }, [user]);

  const trialDaysLeft = () => {
    if (clinicInfo.subscription === 'pro') return Infinity;
    const end = new Date(clinicInfo.trialStartDate);
    end.setDate(end.getDate() + 7);
    const diff = end - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isTrialActive = trialDaysLeft() > 0 || clinicInfo.subscription === 'pro';

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!isTrialActive) return;
    const formData = new FormData(e.target);
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'assets'), {
      name: formData.get('name'),
      brand: formData.get('brand'),
      serial: formData.get('serial'),
      nextMaintenance: formData.get('nextMaintenance'),
      createdAt: new Date().toISOString(),
      value: Math.floor(Math.random() * 5000) + 1000
    });
    setIsAddModalOpen(false);
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-black uppercase text-slate-300">Syncing...</div>;
  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {isScannerOpen && <QRScanner onScan={(id) => { const a = assets.find(x => x.id === id); if(a) { setSelectedAsset(a); setView('detail'); setIsScannerOpen(false); } }} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
        <div className="p-10">
          <div className="flex items-center gap-3 text-blue-600 mb-14 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-2xl"><Stethoscope size={26} /></div>
            <span className="text-2xl font-black tracking-tighter uppercase">MEDILOG</span>
          </div>
          <nav className="space-y-2">
            <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setView('dashboard')} />
            <NavItem active={view === 'inventory'} icon={<Wrench size={20}/>} label="Inventory" onClick={() => setView('inventory')} />
            <NavItem active={view === 'reports'} icon={<History size={20}/>} label="Analytics" onClick={() => setView('reports')} />
            <NavItem active={view === 'settings'} icon={<Settings size={20}/>} label="Settings" onClick={() => setView('settings')} />
          </nav>
        </div>

        <div className="mt-auto p-6 m-4 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase">{user.email?.substring(0, 2)}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate uppercase">{clinicInfo.name}</p>
              <Badge variant={clinicInfo.subscription === 'pro' ? 'premium' : 'default'}>{clinicInfo.subscription === 'pro' ? 'PRO' : 'FREE'}</Badge>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-rose-600 hover:bg-rose-100 rounded-xl uppercase tracking-[0.2em] transition-all"><LogOut size={14} /> Log Out</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">{view}</h1>
            <button onClick={() => setIsScannerOpen(true)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl"><QrCode size={16} /> SCAN QR</button>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all"><Plus size={18} /> ADD ASSET</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {view === 'dashboard' && (
            <div className="space-y-10 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={<Stethoscope/>} color="blue" label="Total Assets" value={assets.length} />
                <StatCard icon={<CheckCircle2/>} color="emerald" label="Operational" value={assets.length} />
                <StatCard icon={<Clock/>} color="amber" label="Due Service" value="3" />
                <StatCard icon={<AlertTriangle/>} color="rose" label="Alerts" value="0" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recent Inventory</h2>
                  <Card className="overflow-hidden border-none shadow-xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b"><tr><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Device</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Status</th><th className="px-8 py-5"></th></tr></thead>
                      <tbody className="divide-y divide-slate-50">{assets.slice(0, 5).map((a) => (<tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedAsset(a); setView('detail'); }}><td className="px-8 py-6"><p className="font-black text-sm text-slate-700">{a.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{a.brand}</p></td><td className="px-8 py-6 text-center"><Badge variant="success">READY</Badge></td><td className="px-8 py-6 text-right"><ChevronRight size={20} className="text-slate-200"/></td></tr>))}</tbody>
                    </table>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {view === 'detail' && selectedAsset && (
            <div className="max-w-6xl mx-auto space-y-10">
               <button onClick={() => setView('dashboard')} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest hover:underline"><ChevronRight size={14} className="rotate-180"/> Back to Dashboard</button>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-10"><Card className="p-12 border-t-[12px] border-t-blue-600 rounded-[3rem] shadow-2xl"><div className="flex flex-col md:flex-row gap-12"><div className="w-48 h-48 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200"><Stethoscope size={64} /></div><div className="flex-1 space-y-10"><div><Badge variant="success">CERTIFIED</Badge><h2 className="text-5xl font-black mt-4 leading-none tracking-tighter text-slate-800">{selectedAsset.name}</h2><p className="text-slate-400 font-black uppercase text-xs mt-3">{selectedAsset.brand}</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-10 border-t border-slate-50"><DetailItem label="Serial ID" value={selectedAsset.serial} /><DetailItem label="Next Service" value={selectedAsset.nextMaintenance} /></div></div></div></Card></div>
                 <div className="space-y-10"><Card className="p-12 text-center bg-slate-900 text-white rounded-[3rem] shadow-2xl"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-10">Asset Identity</p><QRCodeImage data={`${window.location.origin}/asset/${selectedAsset.id}`} size={160} /><button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-10">Download Label</button></Card></div>
               </div>
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <Modal title="Register New Asset" onClose={() => setIsAddModalOpen(false)}>
            <form onSubmit={handleAddAsset} className="space-y-6"><FormItem label="Asset Name" name="name" required placeholder="e.g. Ultrasound Machine" /><div className="grid grid-cols-2 gap-6"><FormItem label="Brand" name="brand" required placeholder="Brand name" /><FormItem label="Serial Number" name="serial" required placeholder="Unique ID" /></div><FormItem label="Next Service Date" name="nextMaintenance" type="date" required /><div className="pt-6"><button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all">Save to Cloud</button></div></form>
        </Modal>
      )}
    </div>
  );
}

// --- Style Components ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}>{icon} <span className="uppercase tracking-widest">{label}</span></button>
);

const StatCard = ({ icon, label, value, color }) => {
  const styles = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <Card className="p-8 border-none shadow-xl"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${styles[color]}`}>{icon}</div><p className="text-4xl font-black tracking-tighter text-slate-800">{value}</p><p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">{label}</p></Card>
  );
};

const FormItem = ({ label, type = "text", ...props }) => (
  <div className="space-y-2"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</label><input type={type} {...props} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all" /></div>
);

const DetailItem = ({ label, value }) => (
  <div><p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1.5">{label}</p><p className="text-md font-black text-slate-700">{value || 'N/A'}</p></div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6"><Card className="w-full max-w-xl shadow-2xl overflow-hidden rounded-[3rem]"><div className="p-10 border-b flex items-center justify-between bg-slate-50/50"><h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3><button onClick={onClose} className="p-3 hover:bg-white rounded-full text-slate-300 transition-all"><X size={24}/></button></div><div className="p-12 bg-white">{children}</div></Card></div>
);
