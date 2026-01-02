import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  LayoutDashboard, Stethoscope, Printer, Plus, LogOut, Trash2, 
  Search, X, QrCode, AlertTriangle, CheckCircle2, History, Camera,
  Settings, CreditCard, Save, MapPin, Phone, Mail, ChevronRight, User
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

// --- 1. FIREBASE CONFIG ---
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

// --- 2. PLANLAR VE SABİTLER ---
const PLANS = [
  { id: 'vet', name: 'Veterinary', price: 39, color: 'bg-emerald-500', features: ['15 Devices Limit', 'Vaccine Tracking', 'Email Support'] },
  { id: 'dental', name: 'Dental Clinic', price: 49, color: 'bg-cyan-600', features: ['20 Devices Limit', 'Warranty Tracking', 'Unlimited QR'], recommended: true },
  { id: 'growth', name: 'Growth Package', price: 89, color: 'bg-indigo-600', features: ['50 Devices Limit', 'Multi-Location', 'SMS Alerts'] }
];

// --- 3. UI COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type="button", disabled }) => {
  const styles = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200",
    secondary: "bg-slate-800 text-white hover:bg-slate-900",
    outline: "bg-white text-slate-600 border-2 border-slate-100 hover:border-cyan-200 hover:text-cyan-600",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    success: "bg-emerald-500 text-white hover:bg-emerald-600"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all" {...props} />
  </div>
);

// --- 4. ALT SAYFALAR (VIEWS) ---

// >> AYARLAR SAYFASI (GERÇEK VERİTABANI KAYDI)
const SettingsView = ({ user, clinicData }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      updatedAt: serverTimestamp()
    };

    try {
      // Users koleksiyonunda ilgili kullanıcının 'settings' alt belgesine yazar
      await setDoc(doc(db, `users/${user.uid}/settings/profile`), data, { merge: true });
      setMsg('Settings saved successfully to Database!');
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-black text-slate-900 mb-2">Clinic Settings</h2>
      <p className="text-slate-500 mb-8">Manage your clinic profile and preferences.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <button className="w-full text-left p-4 bg-cyan-50 text-cyan-700 rounded-xl font-bold border border-cyan-100">General Profile</button>
          <button className="w-full text-left p-4 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">Notifications</button>
          <button className="w-full text-left p-4 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">Security</button>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <Camera size={24}/>
              </div>
              <div>
                <Button variant="outline" className="py-2 text-xs">Upload Logo</Button>
                <p className="text-[10px] text-slate-400 mt-2">Visible on QR Labels</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Clinic Name" name="name" defaultValue={clinicData?.name || ''} placeholder="e.g. City Dental" required />
              <Input label="Phone Number" name="phone" defaultValue={clinicData?.phone || ''} placeholder="+1..." />
            </div>
            <Input label="Email Address" defaultValue={user.email} disabled />
            <Input label="Full Address" name="address" defaultValue={clinicData?.address || ''} placeholder="Street, City, Zip..." />

            {msg && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold text-center border border-emerald-100 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {msg}</div>}
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={loading} icon={Save}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// >> FATURA VE PLANLAR SAYFASI (PLAN GÜNCELLEME)
const BillingView = ({ user, currentPlan, onUpgrade }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Subscription & Plans</h2>
          <p className="text-slate-500 mt-2">Current Plan: <span className="text-cyan-600 font-black uppercase bg-cyan-50 px-2 py-1 rounded-lg">{currentPlan || 'Free Trial'}</span></p>
        </div>
        <Button variant="outline" icon={History}>Billing History</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`relative bg-white p-8 rounded-3xl border-2 transition-all hover:-translate-y-1 ${plan.id === currentPlan ? 'border-cyan-500 shadow-xl ring-4 ring-cyan-50' : 'border-slate-100 shadow-sm'}`}>
            {plan.recommended && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recommended</span>}
            <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
            <div className="flex items-baseline gap-1 my-4">
              <span className="text-4xl font-black text-slate-900">${plan.price}</span>
              <span className="text-slate-400 font-bold">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={16} className="text-cyan-500 shrink-0"/> {f}
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => onUpgrade(plan.id)} 
              variant={plan.id === currentPlan ? 'success' : 'primary'} 
              className={`w-full ${plan.id === currentPlan ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
              disabled={plan.id === currentPlan}
            >
              {plan.id === currentPlan ? 'Active Plan' : 'Select Plan'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// >> QR SCANNER (GERÇEK KAMERA)
const QRScannerOverlay = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render((txt) => { scanner.clear(); onScan(txt); }, (err) => console.log(err));
    return () => scanner.clear().catch(e => console.error(e));
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-4 rounded-3xl w-full max-w-sm shadow-2xl">
        <h3 className="text-center font-black mb-4">Scan Device QR</h3>
        <div id="reader" className="w-full rounded-xl overflow-hidden"></div>
      </div>
      <button onClick={onClose} className="mt-8 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-bold transition-all">Close Camera</button>
    </div>
  );
};

// --- ANA UYGULAMA MANTĞI ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [assets, setAssets] = useState([]);
  const [clinicData, setClinicData] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  
  // Modallar ve Durumlar
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // AUTH STATE LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        setView('dashboard');
        // Kullanıcı Ayarlarını ve Planını Çek
        const docRef = doc(db, `users/${u.uid}/settings/profile`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setClinicData(snap.data());
          if(snap.data().plan) setUserPlan(snap.data().plan);
        }
      }
    });
    return () => unsub();
  }, []);

  // ASSETS LISTENER (GERÇEK ZAMANLI)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/assets`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  // PLAN YÜKSELTME İŞLEMİ (DB YAZMA)
  const handleUpgrade = async (planId) => {
    if(!confirm(`Are you sure you want to upgrade to ${planId.toUpperCase()} plan?`)) return;
    await setDoc(doc(db, `users/${user.uid}/settings/profile`), { plan: planId }, { merge: true });
    setUserPlan(planId);
  };

  // CİHAZ EKLEME
  const handleAddAsset = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await addDoc(collection(db, `users/${user.uid}/assets`), {
      name: formData.get('name'),
      brand: formData.get('brand'),
      serial: formData.get('serial'),
      nextService: formData.get('nextService'),
      status: 'good',
      createdAt: serverTimestamp()
    });
    setIsAddModalOpen(false);
  };

  // LOGIN / REGISTER
  const handleAuth = async (isReg, email, pass) => {
    try {
      if (isReg) await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) { alert("Auth Error: " + e.message); }
  };

  // --- RENDER ---
  if (loading) return <div className="h-screen w-screen flex items-center justify-center text-cyan-600 font-black animate-pulse">LOADING MEDILOG...</div>;

  if (view === 'landing' && !user) return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-cyan-600 font-black text-xl"><Stethoscope strokeWidth={3}/> MEDILOG</div>
        <button onClick={() => setView('auth')} className="font-bold text-slate-600 hover:text-cyan-600">Clinic Login</button>
      </nav>
      <header className="text-center py-24 px-6">
        <h1 className="text-6xl font-black text-slate-900 mb-8 tracking-tighter">Never Miss a <br/><span className="text-cyan-600">Maintenance</span> Again.</h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">The operating system for Dental & Vet clinics. Track assets, print QR labels, and stay compliant.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => setView('auth')} className="px-10 py-5 text-lg shadow-xl shadow-cyan-200">Start Free Trial</Button>
          <Button variant="outline" className="px-10 py-5 text-lg">View Pricing</Button>
        </div>
      </header>
    </div>
  );

  if (view === 'auth' && !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2rem] shadow-xl">
        <h2 className="text-3xl font-black text-center mb-6">Clinic Access</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleAuth(false, e.target.email.value, e.target.pass.value); }} className="space-y-4">
          <Input name="email" placeholder="Email Address" required />
          <Input name="pass" type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <button onClick={() => setView('landing')} className="w-full mt-6 text-xs text-slate-400 font-bold">← Back to Home</button>
        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
           <p className="text-xs text-slate-400 mb-2">New Clinic?</p>
           <Button variant="outline" onClick={() => handleAuth(true, prompt('Email?'), prompt('Password?'))} className="w-full py-2 text-xs">Create Account</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {isScannerOpen && <QRScannerOverlay onScan={(txt) => { alert("Scanned: " + txt); setIsScannerOpen(false); }} onClose={() => setIsScannerOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-2 text-cyan-600 font-black text-xl mb-10 px-2">
          <Stethoscope size={28} strokeWidth={3}/> MEDILOG
        </div>
        
        <div className="mb-8 px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm"><User size={14}/></div>
             <div className="overflow-hidden">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Clinic</p>
               <p className="font-bold truncate text-sm">{clinicData?.name || 'My Clinic'}</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${userPlan === 'free' ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
             <p className="text-xs font-bold uppercase text-slate-500">{userPlan} Plan</p>
           </div>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="ghost" onClick={() => setView('dashboard')} className={`w-full justify-start ${view === 'dashboard' ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`} icon={LayoutDashboard}>Overview</Button>
          <Button variant="ghost" onClick={() => setView('settings')} className={`w-full justify-start ${view === 'settings' ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`} icon={Settings}>Settings</Button>
          <Button variant="ghost" onClick={() => setView('billing')} className={`w-full justify-start ${view === 'billing' ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`} icon={CreditCard}>Billing & Plans</Button>
        </nav>
        
        <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-rose-500 font-bold p-4 hover:bg-rose-50 rounded-xl transition-all text-sm"><LogOut size={16}/> Sign Out</button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen">
        {view === 'settings' && <SettingsView user={user} clinicData={clinicData} />}
        {view === 'billing' && <BillingView user={user} currentPlan={userPlan} onUpgrade={handleUpgrade} />}
        
        {view === 'dashboard' && (
          <>
            <header className="flex justify-between items-center mb-10">
              <h1 className="text-3xl font-black">Dashboard</h1>
              <div className="flex gap-3">
                <Button variant="outline" icon={Camera} onClick={() => setIsScannerOpen(true)}>Scan QR</Button>
                <Button variant="outline" icon={Printer} onClick={() => window.print()}>Print Labels</Button>
                <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Device</Button>
              </div>
            </header>

            {assets.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><Plus size={32}/></div>
                 <h3 className="text-xl font-black text-slate-400">No Devices Yet</h3>
                 <p className="text-slate-400 mb-6 text-sm">Add your first equipment to start tracking.</p>
                 <Button onClick={() => setIsAddModalOpen(true)}>Add Device</Button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {assets.map(asset => (
                  <div key={asset.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><Stethoscope size={24}/></div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${asset.status === 'good' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{asset.status === 'good' ? 'Active' : 'Service Due'}</div>
                    </div>
                    <h3 className="text-lg font-black text-slate-800">{asset.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{asset.brand}</p>
                    
                    <div className="flex justify-center mb-6 p-4 bg-slate-50 rounded-xl group-hover:bg-cyan-50 transition-colors">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://medilog.app/asset/${asset.id}`)}`} className="w-24 h-24 mix-blend-multiply opacity-80" />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <div className="text-xs">
                         <p className="font-bold text-slate-400 uppercase">Next Service</p>
                         <p className="font-bold text-slate-800">{asset.nextService}</p>
                       </div>
                       <button onClick={() => {if(confirm('Delete asset?')) deleteDoc(doc(db, `users/${user.uid}/assets`, asset.id))}} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Add New Device</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400 hover:text-rose-500"/></button>
            </div>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <Input name="name" label="Device Name" placeholder="e.g. X-Ray Sensor" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="brand" label="Brand" placeholder="Manufacturer" required />
                <Input name="serial" label="Serial No" placeholder="SN-1234" required />
              </div>
              <Input name="nextService" type="date" label="Next Service Due" required />
              <div className="flex gap-4 mt-8 pt-4">
                <Button variant="outline" className="w-full" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="w-full">Save Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body * { visibility: hidden; }
          .grid, .grid * { visibility: visible; }
          .grid { position: absolute; left: 0; top: 0; width: 100%; display: grid !important; grid-template-columns: 1fr 1fr; gap: 1cm; }
          aside, header, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
