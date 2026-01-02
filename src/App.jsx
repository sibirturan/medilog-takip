import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Stethoscope, Printer, Plus, LogOut, Trash2, 
  Search, X, QrCode, AlertTriangle, CheckCircle2, Camera,
  Settings, CreditCard, Save, Calendar, AlertCircle
} from 'lucide-react';
// DİKKAT: Scanner yerine core kütüphaneyi çağırıyoruz
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

// Plans
const PLANS = [
  { id: 'vet', name: 'Veterinary', price: 39, devices: 15, features: ['Up to 15 devices', 'Vaccine tracking', 'Email reminders'] },
  { id: 'dental', name: 'Dental Clinic', price: 49, devices: 20, features: ['Up to 20 devices', 'Unlimited QR labels', 'Warranty tracking'], recommended: true },
  { id: 'growth', name: 'Growth Package', price: 89, devices: 50, features: ['Up to 50 devices', 'Multi-location', 'SMS alerts', 'Priority support'] }
];

// UI Components
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = "button", disabled }) => {
  const styles = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-700",
    outline: "bg-white text-slate-700 border-2 border-slate-200 hover:border-cyan-500",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    ghost: "bg-transparent hover:bg-slate-100"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${styles[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-bold text-slate-600 uppercase">{label}</label>}
    <input className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-cyan-500 outline-none" {...props} />
  </div>
);

const Alert = ({ variant = 'info', children }) => {
  const styles = {
    danger: 'bg-rose-50 border-rose-200 text-rose-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  };
  return <div className={`p-4 border-2 rounded-lg ${styles[variant]}`}>{children}</div>;
};

// --- GÜNCELLENEN QR SCANNER (MOBİL UYUMLU) ---
const QRScanner = ({ onScan, onClose }) => {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    
    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, // Arka kamerayı zorla
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // Başarılı okuma
            html5QrCode.stop().then(() => {
              onScan(decodedText);
            });
          },
          (errorMessage) => {
            // Okuma hatası (görmezden gelinebilir, sürekli tetiklenir)
          }
        );
      } catch (err) {
        console.error("Kamera hatası:", err);
        alert("Kamera başlatılamadı. İzinleri kontrol edin.");
      }
    };

    startScanner();

    // Temizlik
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error(err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md aspect-square bg-black overflow-hidden">
        <div id="reader" className="w-full h-full"></div>
        {/* Görsel Çerçeve */}
        <div className="absolute inset-0 border-[50px] border-black/50 pointer-events-none">
          <div className="w-full h-full border-2 border-cyan-500 animate-pulse relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-500"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-500"></div>
          </div>
        </div>
      </div>
      <p className="text-white mt-8 font-bold animate-pulse">QR Kodu Çerçeveye Tutun</p>
      <button 
        onClick={onClose} 
        className="absolute top-8 right-8 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 backdrop-blur-md"
      >
        <X size={24} />
      </button>
    </div>
  );
};

// Settings View
const SettingsView = ({ user, clinicData }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      name: e.target.clinicName.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, `users/${user.uid}/settings/profile`), data, { merge: true });
      setMsg('Settings saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { alert('Error: ' + err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Clinic Settings</h2>
      <div className="bg-white p-6 rounded-xl border-2 border-slate-200">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Clinic Name" name="clinicName" defaultValue={clinicData?.name || ''} required />
          <Input label="Phone" name="phone" defaultValue={clinicData?.phone || ''} />
          <Input label="Address" name="address" defaultValue={clinicData?.address || ''} />
          {msg && <Alert variant="success">{msg}</Alert>}
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</Button>
        </form>
      </div>
    </div>
  );
};

// Billing View
const BillingView = ({ currentPlan, onUpgrade, deviceCount }) => (
  <div className="max-w-5xl">
    <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {PLANS.map(plan => (
        <div key={plan.id} className={`bg-white p-6 rounded-xl border-2 ${plan.id === currentPlan ? 'border-cyan-500' : 'border-slate-200'}`}>
          {plan.recommended && <span className="bg-cyan-600 text-white text-xs px-3 py-1 rounded-full font-bold">RECOMMENDED</span>}
          <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
          <p className="text-3xl font-bold my-3">${plan.price}<span className="text-sm text-slate-500">/month</span></p>
          <ul className="space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="text-sm flex gap-2 items-start"><CheckCircle2 size={16} className="text-cyan-500 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Button onClick={() => onUpgrade(plan.id)} disabled={plan.id === currentPlan} className="w-full">
            {plan.id === currentPlan ? 'Current Plan' : 'Select Plan'}
          </Button>
        </div>
      ))}
    </div>
  </div>
);

// Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [assets, setAssets] = useState([]);
  const [clinicData, setClinicData] = useState(null);
  const [userPlan, setUserPlan] = useState('dental');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, `users/${currentUser.uid}/settings/profile`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setClinicData(snap.data());
          if (snap.data().plan) setUserPlan(snap.data().plan);
        }
        setView('dashboard');
      } else {
        setUser(null);
        setClinicData(null);
        setAssets([]);
        setView('landing');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/assets`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAssets(data);
    });
    return () => unsub();
  }, [user]);

  const handleAuth = async (isRegister) => {
    try {
      if (isRegister) await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      else await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (err) { alert('Authentication error: ' + err.message); }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (err) { console.error(err); }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const data = {
      name: e.target.deviceName.value,
      brand: e.target.brand.value,
      serial: e.target.serial.value,
      location: e.target.location.value,
      nextService: e.target.nextService.value,
      warrantyExpiry: e.target.warranty.value,
      status: 'active',
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, `users/${user.uid}/assets`), data);
      setIsAddModalOpen(false);
    } catch (err) { alert('Error adding device: ' + err.message); }
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm('Delete this device?')) return;
    try { await deleteDoc(doc(db, `users/${user.uid}/assets`, id)); } catch (err) { alert('Error: ' + err.message); }
  };

  const handleUpgrade = async (planId) => {
    if (!confirm('Change subscription plan?')) return;
    await setDoc(doc(db, `users/${user.uid}/settings/profile`), { plan: planId }, { merge: true });
    setUserPlan(planId);
  };

  const handleQRScan = (scannedText) => {
    setIsScannerOpen(false);
    const assetId = scannedText.split('/').pop();
    const found = assets.find(a => a.id === assetId);
    if (found) {
      alert(`DEVICE FOUND:\nName: ${found.name}\nSerial: ${found.serial}`);
    } else {
      alert('Device not found in inventory.');
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAlertStatus = (nextService) => {
    if (!nextService) return 'ok';
    const days = Math.floor((new Date(nextService) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'overdue';
    if (days <= 7) return 'warning';
    return 'ok';
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Stethoscope className="animate-pulse text-cyan-600" size={48} /></div>;

  if (view === 'landing' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        <nav className="p-4 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xl"><Stethoscope /> MediLog</div>
          <Button variant="outline" onClick={() => setView('auth')}>Sign In</Button>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-black mb-4">Never Forget Equipment Maintenance</h1>
          <p className="text-xl text-slate-600 mb-8">Track your clinic devices with QR codes.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setView('auth')} className="px-8 py-4 text-lg">Start Free Trial</Button>
            <Button variant="outline" onClick={() => setView('pricing')} className="px-8 py-4 text-lg">Pricing</Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'pricing' && !user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setView('landing')} className="mb-6 text-slate-600">← Back</button>
          <BillingView currentPlan={null} onUpgrade={() => setView('auth')} deviceCount={0} />
        </div>
      </div>
    );
  }

  if (view === 'auth' && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <Stethoscope className="text-cyan-600 mx-auto mb-2" size={40} />
            <h2 className="text-2xl font-bold">Sign In</h2>
          </div>
          <div className="space-y-4">
            <Input label="Email" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
            <Input label="Password" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
            <Button onClick={() => handleAuth(false)} className="w-full">Sign In</Button>
            <button onClick={() => handleAuth(true)} className="w-full text-sm text-cyan-600">Create Account</button>
          </div>
          <button onClick={() => setView('landing')} className="w-full mt-4 text-sm text-slate-500">← Back</button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isScannerOpen && <QRScanner onScan={handleQRScan} onClose={() => setIsScannerOpen(false)} />}
      
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r p-6 h-screen sticky top-0">
        <div className="flex items-center gap-2 text-cyan-600 font-bold text-xl mb-8"><Stethoscope /> MediLog</div>
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <p className="font-bold truncate">{clinicData?.name || 'My Clinic'}</p>
          <p className="text-xs text-cyan-600 font-bold mt-1 uppercase">{userPlan}</p>
        </div>
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" onClick={() => setView('dashboard')} className="w-full justify-start" icon={LayoutDashboard}>Dashboard</Button>
          <Button variant="ghost" onClick={() => setView('settings')} className="w-full justify-start" icon={Settings}>Settings</Button>
          <Button variant="ghost" onClick={() => setView('billing')} className="w-full justify-start" icon={CreditCard}>Billing</Button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-rose-500 p-3 hover:bg-rose-50 rounded-lg"><LogOut size={16} /> Sign Out</button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {view === 'settings' && <SettingsView user={user} clinicData={clinicData} />}
        {view === 'billing' && <BillingView currentPlan={userPlan} onUpgrade={handleUpgrade} deviceCount={assets.length} />}
        {view === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Devices ({assets.length})</h1>
              <div className="flex gap-3">
                <Button variant="outline" icon={Camera} onClick={() => setIsScannerOpen(true)}>Scan QR</Button>
                <Button variant="outline" icon={Printer} onClick={() => window.print()}>Print Labels</Button>
                <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Device</Button>
              </div>
            </div>
            
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg outline-none focus:border-cyan-500" />
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-300">
                <h3 className="text-xl font-bold text-slate-400 mb-2">No Devices Yet</h3>
                <Button onClick={() => setIsAddModalOpen(true)}>Add Device</Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map(asset => {
                  const status = getAlertStatus(asset.nextService);
                  return (
                    <div key={asset.id} className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between mb-4">
                        <div className="p-2 bg-cyan-50 rounded-lg"><Stethoscope className="text-cyan-600" size={24} /></div>
                        {status === 'overdue' && <span className="text-xs font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-full">OVERDUE</span>}
                        {status === 'ok' && <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">ACTIVE</span>}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{asset.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{asset.brand} • {asset.serial}</p>
                      <div className="flex justify-center p-4 bg-slate-50 rounded-lg mb-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://medilog.app/asset/${asset.id}`)}`} alt="QR" className="w-32 h-32" />
                      </div>
                      <button onClick={() => handleDeleteAsset(asset.id)} className="text-rose-500 text-sm font-semibold flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <h3 className="text-2xl font-bold mb-6">Add New Device</h3>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <Input label="Device Name" name="deviceName" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Brand" name="brand" required />
                <Input label="Serial" name="serial" required />
              </div>
              <Input label="Location" name="location" required />
              <Input label="Next Service" name="nextService" type="date" required />
              <Input label="Warranty" name="warranty" type="date" />
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Add Device</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@media print { aside, button, input { display: none !important; } }`}</style>
    </div>
  );
}
