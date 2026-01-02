import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, LayoutDashboard, Stethoscope, Settings, QrCode, Wrench, History, 
  LogOut, MoreVertical, AlertTriangle, CheckCircle2, Clock, ChevronRight, 
  Search, Filter, X, Camera, Download, Calendar, User, Bell, Globe, 
  ShieldCheck, CreditCard, Save, TrendingUp, DollarSign, Activity, Zap, 
  Lock, Mail, Sparkles
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, onSnapshot, 
  query, orderBy, getDoc, setDoc 
} from 'firebase/firestore';

// --- Firebase Konfigürasyonu ---
// Vercel'e geçtiğinizde buradaki __firebase_config kısmını kendi Firebase verilerinizle değiştirmeyi unutmayın!
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'medilog-live-v1';

// --- Yardımcı Bileşenler ---
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
    danger: "bg-rose-100 text-rose-700",
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

// --- QR Tarayıcı (jsQR Entegrasyonu) ---
const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.onload = startCamera;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      stopCamera();
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
    } catch (err) { setError("Camera access denied."); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
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
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
        <video ref={videoRef} className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 border-[60px] border-black/40">
           <div className="h-full w-full border-2 border-blue-500 rounded-3xl animate-pulse"></div>
        </div>
      </div>
      <div className="mt-12 text-center text-white">
        <h3 className="text-xl font-black uppercase tracking-widest mb-2">Identify Asset</h3>
        <p className="text-slate-400 text-sm font-medium px-8 italic">Point camera at the device's MediLog QR tag.</p>
      </div>
    </div>
  );
};

// --- Auth Ekranı (Login & Signup) ---
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
        const clinicRef = doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'settings', 'clinicInfo');
        await setDoc(clinicRef, {
          name: "Clinic Name",
          address: "",
          email: email,
          currency: "USD",
          subscription: "free",
          trialStartDate: new Date().toISOString()
        });
      }
    } catch (err) {
      setError("Authentication failed. Please check credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200 mb-6"><Stethoscope size={32} /></div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">MediLog</h1>
          <p className="text-slate-500 font-medium mt-2">Enterprise Medical Asset Hub</p>
        </div>

        <Card className="p-10 border-none shadow-2xl shadow-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all" />
            </div>
            {error && <div className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isLogin ? 'Establish Session' : 'Register Account'}
            </button>
          </form>
          <div className="mt-8 text-center border-t pt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
              {isLogin ? "Join MediLog Network" : "Access Existing Portal"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Ana Uygulama ---
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
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e) {}
      }
    };
    initAuth();
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

  const handleUpdateClinic = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = { ...clinicInfo, name: formData.get('clinicName') || clinicInfo.name };
    setClinicInfo(updated);
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'clinicInfo'), updated);
  };

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

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-black uppercase text-slate-300">Synchronizing...</div>;
  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {isScannerOpen && <QRScanner onScan={(id) => { const a = assets.find(x => x.id === id); if(a) { setSelectedAsset(a); setView('detail'); setIsScannerOpen(false); } }} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
        <div className="p-10">
          <div className="flex items-center gap-3 text-blue-600 mb-14 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-2xl shadow-blue-100"><Stethoscope size={26} /></div>
            <span className="text-2xl font-black tracking-tighter uppercase">MEDILOG</span>
          </div>
          <nav className="space-y-2">
            <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setView('dashboard')} />
            <NavItem active={view === 'inventory'} icon={<Wrench size={20}/>} label="Inventory" onClick={() => setView('inventory')} />
            <NavItem active={view === 'reports'} icon={<History size={20}/>} label="Analytics" onClick={() => setView('reports')} />
            <NavItem active={view === 'settings'} icon={<Settings size={20}/>} label="Settings" onClick={() => setView('settings')} />
          </nav>

          {clinicInfo.subscription === 'free' && (
            <div className="mt-12 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
               <Sparkles className="absolute -right-2 -top-2 text-indigo-200" size={60}/>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">Trial Phase</p>
               <h4 className="text-xl font-black text-indigo-900 relative z-10 mt-1">{trialDaysLeft()} Days Left</h4>
               <button onClick={() => {setView('settings'); setSettingsTab('billing');}} className="mt-4 w-full py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200 relative z-10">Unlock Pro</button>
            </div>
          )}
        </div>

        <div className="mt-auto p-6 m-4 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase">{user.email?.substring(0, 2)}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate uppercase">{clinicInfo.name}</p>
              <Badge variant={clinicInfo.subscription === 'pro' ? 'premium' : 'default'}>{clinicInfo.subscription === 'pro' ? 'PRO' : 'FREE'}</Badge>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-rose-600 hover:bg-rose-100 rounded-xl transition-all uppercase tracking-[0.2em]"><LogOut size={14} /> Terminate</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">{view}</h1>
            <button onClick={() => setIsScannerOpen(true)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-slate-200 active:scale-95"><QrCode size={16} /> SCAN QR</button>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative hidden xl:block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-3 bg-slate-100 border-none rounded-2xl text-xs w-64 focus:w-80 transition-all font-bold outline-none" /></div>
             <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all"><Plus size={18} /> REGISTER</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {view === 'dashboard' && (
            <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={<Stethoscope/>} color="blue" label="Total Assets" value={assets.length} />
                <StatCard icon={<CheckCircle2/>} color="emerald" label="Operational" value={assets.length} />
                <StatCard icon={<Clock/>} color="amber" label="Upcoming Service" value="3" />
                <StatCard icon={<AlertTriangle/>} color="rose" label="System Risks" value="0" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Inventory Status</h2>
                  <Card className="overflow-hidden border-none shadow-xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b"><tr><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Asset</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Health</th><th className="px-8 py-5"></th></tr></thead>
                      <tbody className="divide-y divide-slate-50">{assets.slice(0, 5).map((a) => (<tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedAsset(a); setView('detail'); }}><td className="px-8 py-6"><p className="font-black text-sm text-slate-700">{a.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{a.brand}</p></td><td className="px-8 py-6 text-center"><Badge variant="success">STABLE</Badge></td><td className="px-8 py-6 text-right"><ChevronRight size={20} className="text-slate-200"/></td></tr>))}</tbody>
                    </table>
                  </Card>
                </div>
                <div className="space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Technical Hub</h2>
                  <ActionButton onClick={() => setIsScannerOpen(true)} icon={<QrCode/>} label="Quick Scanner" sub="Immediate Inspection" color="blue" />
                  <ActionButton onClick={() => setView('reports')} icon={<TrendingUp/>} label="Analytics" sub="Asset Performance" color="emerald" />
                  <ActionButton onClick={() => setIsAddModalOpen(true)} icon={<Plus/>} label="Cloud Entry" sub="Manual Record" color="rose" />
                </div>
              </div>
            </div>
          )}

          {view === 'inventory' && (
            <div className="max-w-7xl mx-auto"><Card className="border-none shadow-2xl"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset</th><th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Number</th><th className="px-8 py-6 text-right">Settings</th></tr></thead><tbody className="divide-y divide-slate-50">{assets.map(a => (<tr key={a.id} className="hover:bg-blue-50/20"><td className="px-8 py-6" onClick={() => { setSelectedAsset(a); setView('detail'); }}><p className="font-black text-sm">{a.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{a.brand}</p></td><td className="px-8 py-6"><code className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg font-black text-slate-500 border border-slate-200">{a.serial}</code></td><td className="px-8 py-6 text-right"><button onClick={() => { setSelectedAsset(a); setView('detail'); }} className="p-3 hover:bg-white rounded-xl text-slate-400 transition-colors"><Settings size={18}/></button></td></tr>))}</tbody></table></Card></div>
          )}

          {view === 'reports' && (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <Card className="p-10 border-l-8 border-l-blue-600"><Activity className="text-blue-600 mb-6" size={32}/><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic Uptime</h3><p className="text-5xl font-black tracking-tighter">99.8%</p></Card>
                 <Card className="p-10 border-l-8 border-l-emerald-600"><DollarSign className="text-emerald-600 mb-6" size={32}/><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Value</h3><p className="text-5xl font-black tracking-tighter">${(assets.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)).toLocaleString()}</p></Card>
                 <Card className="p-10 border-l-8 border-l-rose-600"><Zap className="text-rose-600 mb-6" size={32}/><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</h3><p className="text-5xl font-black tracking-tighter">MAX</p></Card>
               </div>
               <Card className="p-12 text-center bg-slate-900 text-white rounded-[3rem]"><History size={48} className="mx-auto mb-6 text-blue-500 opacity-50"/><h3 className="text-2xl font-black tracking-tight mb-2">Technical Forecast</h3><p className="text-slate-400 font-medium max-w-lg mx-auto italic">High hardware reliability detected across all connected endpoints.</p></Card>
            </div>
          )}

          {view === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-2">
                   <SettingsTab active={settingsTab === 'profile'} onClick={() => setSettingsTab('profile')} icon={<User size={18}/>} label="Clinic Profile" />
                   <SettingsTab active={settingsTab === 'billing'} onClick={() => setSettingsTab('billing')} icon={<CreditCard size={18}/>} label="Licensing" />
                 </div>
                 <div className="md:col-span-2">
                   {settingsTab === 'profile' && (<Card className="p-10"><form onSubmit={handleUpdateClinic} className="space-y-6"><h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Official Records</h3><FormItem label="Clinic Name" name="clinicName" defaultValue={clinicInfo.name} /><button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-2"><Save size={16}/> Commit Updates</button></form></Card>)}
                   {settingsTab === 'billing' && (<div className="space-y-8"><Card className={`p-10 relative overflow-hidden transition-all ${clinicInfo.subscription === 'pro' ? 'bg-indigo-600 text-white shadow-2xl' : 'bg-slate-100 text-slate-400'}`}><div className="relative z-10"><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p><h4 className="text-4xl font-black mt-2 tracking-tighter uppercase">{clinicInfo.subscription === 'pro' ? 'PRO LICENSE' : 'FREE TRIAL'}</h4>{clinicInfo.subscription === 'pro' ? (<div className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm"><CheckCircle2 size={16}/> CLOUD ACTIVE</div>) : (<div className="mt-4 space-y-4"><p className="text-indigo-900 font-bold text-sm">{trialDaysLeft()} days remaining.</p><button onClick={async () => { const up = { ...clinicInfo, subscription: 'pro' }; setClinicInfo(up); await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'clinicInfo'), up); }} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">Upgrade to Pro ($49/mo)</button></div>)}</div><Zap className="absolute -right-6 -bottom-6 opacity-5" size={160}/></Card></div>)}
                 </div>
               </div>
            </div>
          )}

          {view === 'detail' && selectedAsset && (
            <div className="max-w-6xl mx-auto space-y-10 animate-in zoom-in-95 duration-300">
               <button onClick={() => setView('dashboard')} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase tracking-[0.2em] hover:underline"><ChevronRight size={14} className="rotate-180"/> Return to Hub</button>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-10"><Card className="p-12 border-t-[12px] border-t-blue-600 rounded-[3rem] shadow-2xl"><div className="flex flex-col md:flex-row gap-12"><div className="w-48 h-48 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner"><Stethoscope size={64} /></div><div className="flex-1 space-y-10"><div><Badge variant="success">ACTIVE CERTIFIED</Badge><h2 className="text-5xl font-black mt-4 leading-none tracking-tighter text-slate-800">{selectedAsset.name}</h2><p className="text-slate-400 font-black uppercase text-xs mt-3 tracking-[0.3em]">{selectedAsset.brand}</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-10 border-t border-slate-50"><DetailItem label="Technical Serial" value={selectedAsset.serial} /><DetailItem label="Next Inspection" value={selectedAsset.nextMaintenance} /></div></div></div></Card></div>
                 <div className="space-y-10"><Card className="p-12 text-center bg-slate-900 text-white rounded-[3rem] shadow-2xl"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Asset Identity</p><QRCodeImage data={`${window.location.origin}/asset/${selectedAsset.id}`} size={160} /><p className="text-[10px] text-slate-400 mt-10 leading-relaxed font-bold uppercase tracking-widest px-6 opacity-70 italic">Physical tag required for authentication.</p><button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/50 mt-10">Print HD Label</button></Card></div>
               </div>
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <Modal title="Cloud Asset Registration" onClose={() => setIsAddModalOpen(false)}>
          {isTrialActive ? (
            <form onSubmit={handleAddAsset} className="space-y-6"><FormItem label="Asset Name" name="name" required /><div className="grid grid-cols-2 gap-6"><FormItem label="Brand" name="brand" required /><FormItem label="Serial ID" name="serial" required /></div><FormItem label="Service Date" name="nextMaintenance" type="date" required /><div className="pt-6"><button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all">Commit to Cloud</button></div></form>
          ) : (
            <div className="text-center space-y-6"><div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto"><AlertTriangle size={40}/></div><h3 className="text-xl font-black uppercase tracking-tight">License Expired</h3><p className="text-slate-500 text-sm">Please upgrade to Pro plan to add more assets.</p><button onClick={() => {setView('settings'); setSettingsTab('billing'); setIsAddModalOpen(false);}} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Unlock Access</button></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// --- Stil Bileşenleri ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}>{icon} <span className="uppercase tracking-[0.1em]">{label}</span></button>
);

const StatCard = ({ icon, label, value, color }) => {
  const styles = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <Card className="p-8 border-none shadow-xl shadow-slate-200/50"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${styles[color]}`}>{icon}</div><p className="text-4xl font-black tracking-tighter text-slate-800">{value}</p><p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">{label}</p></Card>
  );
};

const ActionButton = ({ icon, label, sub, color, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl transition-all group"><div className="flex items-center gap-5"><div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">{icon}</div><div className="text-left font-sans"><p className="text-[11px] font-black uppercase tracking-tight text-slate-700">{label}</p><p className="text-[10px] text-slate-300 font-bold uppercase mt-1">{sub}</p></div></div><ChevronRight size={18} className="text-slate-100 group-hover:text-slate-300" /></button>
);

const SettingsTab = ({ icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black transition-all ${active ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}>{icon} <span className="uppercase tracking-widest">{label}</span></button>
);

const FormItem = ({ label, type = "text", ...props }) => (
  <div className="space-y-2"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</label><input type={type} {...props} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all" /></div>
);

const DetailItem = ({ label, value }) => (
  <div><p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1.5">{label}</p><p className="text-md font-black text-slate-700">{value || 'N/A'}</p></div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6"><Card className="w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 rounded-[3rem]"><div className="p-10 border-b flex items-center justify-between bg-slate-50/50"><h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{title}</h3><button onClick={onClose} className="p-3 hover:bg-white rounded-full text-slate-300 transition-all"><X size={24}/></button></div><div className="p-12 bg-white">{children}</div></Card></div>
);
