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

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    premium: "bg-indigo-600 text-white shadow-lg",
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${variants[variant]}`}>{children}</span>;
};

const QRCodeImage = ({ data, size = 150 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  return (
    <div className="bg-white p-3 rounded-2xl inline-block border border-slate-100 shadow-inner">
      <img src={qrUrl} alt="QR Code" className="block rounded-lg mx-auto" style={{ width: size, height: size }} />
    </div>
  );
};

// --- AUTH PAGE SECTION ---
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
    } catch (err) { setError("Authentication failed."); } finally { setLoading(false); }
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
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" /></div>
            {error && <div className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-8 text-center border-t pt-6"><button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest">{isLogin ? "Create an Account" : "Back to Sign In"}</button></div>
        </Card>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION SECTION ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [clinicInfo, setClinicInfo] = useState({ name: "New Clinic", subscription: "free" });

  useEffect(() => { return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); }, []);

  useEffect(() => {
    if (!user) return;
    const assetsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'assets');
    const unsubAssets = onSnapshot(query(assetsRef, orderBy('createdAt', 'desc')), (snapshot) => { setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    const clinicRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'clinicInfo');
    getDoc(clinicRef).then(snap => snap.exists() && setClinicInfo(snap.data()));
    return () => unsubAssets();
  }, [user]);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'assets'), {
      name: formData.get('name'), brand: formData.get('brand'), serial: formData.get('serial'), nextMaintenance: formData.get('nextMaintenance'), createdAt: new Date().toISOString()
    });
    setIsAddModalOpen(false);
  };

  const downloadLabel = (asset) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/asset/${asset.id}`)}`;
    fetch(qrUrl)
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MediLog-QR-${asset.name}.png`;
        a.click();
      });
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-black uppercase text-slate-300">Syncing...</div>;
  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 p-10">
        <div className="flex items-center gap-3 text-blue-600 mb-14"><Stethoscope size={26} /><span className="text-2xl font-black tracking-tighter uppercase">MEDILOG</span></div>
        <nav className="space-y-2">
          <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setView('dashboard')} />
          <NavItem active={view === 'inventory'} icon={<Wrench size={20}/>} label="Inventory" onClick={() => setView('inventory')} />
        </nav>
        <button onClick={() => signOut(auth)} className="mt-auto flex items-center gap-2 py-3 text-[10px] font-black text-rose-600 uppercase tracking-widest"><LogOut size={14} /> Log Out</button>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 shrink-0">
          <h1 className="text-[11px] font-black uppercase tracking-widest text-slate-300">{view}</h1>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-2xl"><Plus size={18} /> ADD ASSET</button>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {view === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {assets.map(a => (
                <Card key={a.id} className="p-6 cursor-pointer hover:border-blue-500" onClick={() => { setSelectedAsset(a); setView('detail'); }}>
                  <p className="font-black text-lg">{a.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{a.brand}</p>
                </Card>
              ))}
            </div>
          )}

          {view === 'detail' && selectedAsset && (
            <div className="max-w-6xl mx-auto space-y-10">
               <button onClick={() => setView('dashboard')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">← Back</button>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2"><Card className="p-12 border-t-[12px] border-t-blue-600 rounded-[3rem] shadow-2xl">
                    <h2 className="text-5xl font-black tracking-tighter">{selectedAsset.name}</h2>
                    <div className="grid grid-cols-2 gap-10 mt-10 border-t pt-10">
                      <DetailItem label="Serial ID" value={selectedAsset.serial} />
                      <DetailItem label="Next Service" value={selectedAsset.nextMaintenance} />
                    </div>
                 </Card></div>
                 <div className="space-y-10"><Card className="p-12 text-center bg-slate-900 text-white rounded-[3rem]">
                    <QRCodeImage data={`${window.location.origin}/asset/${selectedAsset.id}`} size={160} />
                    <button onClick={() => downloadLabel(selectedAsset)} className="w-full py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-10">Download Label</button>
                 </Card></div>
               </div>
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && (
        <Modal title="New Asset" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddAsset} className="space-y-6">
            <FormItem label="Asset Name" name="name" required />
            <div className="grid grid-cols-2 gap-6"><FormItem label="Brand" name="brand" required /><FormItem label="Serial ID" name="serial" required /></div>
            <FormItem label="Service Date" name="nextMaintenance" type="date" required />
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}>{icon} <span className="uppercase tracking-widest">{label}</span></button>
);

const FormItem = ({ label, type = "text", ...props }) => (
  <div className="space-y-2"><label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</label><input type={type} {...props} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" /></div>
);

const DetailItem = ({ label, value }) => (
  <div><p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1.5">{label}</p><p className="text-md font-black text-slate-700">{value || 'N/A'}</p></div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6"><Card className="w-full max-w-xl shadow-2xl rounded-[3rem] overflow-hidden"><div className="p-10 border-b flex justify-between bg-slate-50/50"><h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3><button onClick={onClose} className="text-slate-300"><X size={24}/></button></div><div className="p-12 bg-white">{children}</div></Card></div>
);
