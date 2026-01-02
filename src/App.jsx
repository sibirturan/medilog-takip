import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Stethoscope, QrCode, Wrench, History, Settings, 
  LogOut, Plus, ChevronRight, Camera, X, Download, Printer, 
  AlertTriangle, CheckCircle2, Search, Mail, PlayCircle, ArrowRight,
  Menu, ShieldCheck, Zap, UserPlus
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// --- 1. CONFIGURATION & CONSTANTS ---
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

const CLINIC_TYPES = {
  dental: { label: 'Dental Clinic', icon: '🦷', color: 'cyan', devices: ['X-Ray Sensor', 'Autoclave', 'Dental Chair', 'Compressor'] },
  vet: { label: 'Veterinary Clinic', icon: '🐕', color: 'emerald', devices: ['Ultrasound', 'Anesthesia Unit', 'Vaccine Fridge', 'Microscope'] },
  aesthetic: { label: 'Aesthetic Center', icon: '✨', color: 'rose', devices: ['Laser Device', 'Cryolipolysis', 'Skin Analyzer'] }
};

// --- 2. UTILITY COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled }) => {
  const styles = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200",
    secondary: "bg-slate-800 text-white hover:bg-slate-900",
    outline: "bg-white text-slate-600 border-2 border-slate-100 hover:border-cyan-200 hover:text-cyan-600",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}>
      {Icon && <Icon size={18} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ status }) => {
  const config = {
    good: { color: 'bg-emerald-100 text-emerald-700', label: 'Operational' },
    warning: { color: 'bg-amber-100 text-amber-700', label: 'Maintenance Due' },
    critical: { color: 'bg-rose-100 text-rose-700', label: 'Critical' }
  };
  const s = config[status] || config.good;
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>;
};

// --- 3. PAGE COMPONENTS ---

// >> LANDING PAGE & PRICING
const LandingPage = ({ onStart, onDemo }) => (
  <div className="min-h-screen bg-white font-sans text-slate-900">
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 text-cyan-600">
          <Stethoscope size={28} strokeWidth={3} />
          <span className="text-xl font-black tracking-tighter uppercase">MEDILOG</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onDemo} className="text-sm font-bold text-slate-500 hover:text-cyan-600">Try Demo</button>
          <Button onClick={onStart} className="py-2 px-4 text-xs">Login</Button>
        </div>
      </div>
    </nav>

    <header className="px-6 py-24 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-xs font-black uppercase tracking-widest mb-8">
        <Zap size={14} fill="currentColor" /> New: Technician Mode Added
      </div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-8">
        The Operating System for <br/><span className="text-cyan-600">Modern Clinics</span>.
      </h1>
      <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12">
        Stop using spreadsheets. Track warranties, schedule maintenance, and print QR labels for your dental or vet equipment in seconds.
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Button onClick={onStart} icon={ArrowRight} className="text-lg px-8 py-4">Start Free 14-Day Trial</Button>
        <Button variant="outline" onClick={onDemo} icon={PlayCircle} className="text-lg px-8 py-4">View Live Demo</Button>
      </div>
    </header>

    <section className="py-20 bg-slate-50 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-16">Simple Pricing. No Hidden Fees.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Veterinary", price: "$39", icon: "🐕", features: ["Up to 15 Devices", "Vaccine Fridge Tracking", "Email Reminders"] },
            { title: "Dental Clinic", price: "$49", icon: "🦷", features: ["Up to 20 Devices", "Warranty Tracking", "Unlimited QR Labels"], best: true },
            { title: "Growth", price: "$89", icon: "💎", features: ["Up to 50 Devices", "Multi-Location", "SMS Notifications"] }
          ].map((plan, i) => (
            <div key={i} className={`relative bg-white p-8 rounded-3xl border-2 ${plan.best ? 'border-cyan-500 shadow-xl' : 'border-transparent shadow-sm'}`}>
              {plan.best && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</span>}
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-xl font-black">{plan.title}</h3>
              <div className="flex items-baseline gap-1 my-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map(f => <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600"><CheckCircle2 size={16} className="text-cyan-500"/> {f}</li>)}
              </ul>
              <Button onClick={onStart} variant={plan.best ? 'primary' : 'outline'} className="w-full">Start Trial</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// >> ONBOARDING WIZARD (New Feature)
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);

  const steps = [
    { title: "Clinic Type", desc: "Select your specialty" },
    { title: "First Device", desc: "Add your most important asset" },
    { title: "Get QR", desc: "Print your first label" },
    { title: "Ready", desc: "Setup complete" }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex justify-between mb-8">
          {steps.map((s, i) => (
            <div key={i} className={`text-center transition-all ${step === i + 1 ? 'opacity-100 scale-110' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black mx-auto mb-2 ${step > i ? 'bg-cyan-600 text-white' : 'bg-slate-200'}`}>{i + 1}</div>
              <p className="text-[10px] uppercase font-bold">{s.title}</p>
            </div>
          ))}
        </div>

        <Card className="p-10 text-center">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">What type of clinic are you?</h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(CLINIC_TYPES).map(([key, data]) => (
                  <button key={key} onClick={() => setType(key)} className={`p-4 rounded-xl border-2 transition-all ${type === key ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="text-3xl mb-2">{data.icon}</div>
                    <p className="text-xs font-bold">{data.label}</p>
                  </button>
                ))}
              </div>
              <Button disabled={!type} onClick={() => setStep(2)} className="w-full">Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Add your first device</h2>
              <p className="text-slate-500 text-sm">Let's create a record for one of your machines.</p>
              <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Device Name</p>
                <p className="font-black text-lg text-slate-800">{CLINIC_TYPES[type].devices[0]}</p>
                <p className="text-xs text-emerald-600 font-bold mt-2">✓ Auto-detected based on your clinic type</p>
              </div>
              <Button onClick={() => setStep(3)} className="w-full">Create Device</Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <QrCode size={64} />
              </div>
              <h2 className="text-2xl font-black">This is your QR Code</h2>
              <p className="text-slate-500 text-sm">In the full app, you can print these 6-per-page.</p>
              <Button onClick={() => setStep(4)} className="w-full">It Works!</Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black">You are all set!</h2>
              <p className="text-slate-500">Welcome to your new digital clinic.</p>
              <Button onClick={() => onComplete(type)} className="w-full">Enter Dashboard</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// >> PRINT LAYOUT (CSS Trick for A4)
const PrintLayout = ({ assets, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/90 z-[100] overflow-y-auto">
    <div className="max-w-4xl mx-auto my-10 bg-white min-h-[297mm] w-[210mm] p-[10mm] relative shadow-2xl">
      <button onClick={onClose} className="absolute top-4 right-full mr-4 text-white hover:text-rose-400 print:hidden"><X size={32}/></button>
      <button onClick={() => window.print()} className="absolute top-16 right-full mr-4 bg-white px-4 py-2 rounded-lg font-bold print:hidden">Print Now</button>
      
      <div className="grid grid-cols-2 gap-[5mm] grid-rows-3 h-full content-start">
        {assets.slice(0, 6).map(asset => (
          <div key={asset.id} className="border-2 border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center text-center h-[90mm]">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
               <Stethoscope size={24} /> <span className="font-black uppercase tracking-widest">MediLog</span>
            </div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/asset/${asset.id}`} className="w-48 h-48 mb-4 mix-blend-multiply" alt="QR" />
            <p className="text-xs font-bold uppercase tracking-widest mb-1">Scan for Service</p>
            <h3 className="text-xl font-black">{asset.name}</h3>
            <p className="text-xs text-slate-500">{asset.serial}</p>
          </div>
        ))}
      </div>
    </div>
    <style>{`@media print { body * { visibility: hidden; } .max-w-4xl, .max-w-4xl * { visibility: visible; } .max-w-4xl { position: absolute; left: 0; top: 0; margin: 0; width: 100%; } button { display: none; } }`}</style>
  </div>
);

// >> PUBLIC ASSET PAGE (No Login Required)
const PublicAssetPage = ({ assetId, onBack }) => {
  // Simulated data fetch
  const asset = { 
    name: 'Autoclave Pro', 
    brand: 'Tuttnauer', 
    status: 'good', 
    lastService: '2024-12-01', 
    nextService: '2025-06-01',
    history: [
      { date: '2024-12-01', tech: 'John Doe', note: 'Replaced gasket.' },
      { date: '2024-06-01', tech: 'Jane Smith', note: 'Routine calibration.' }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 text-cyan-600 mb-8 opacity-50">
          <Stethoscope size={20} /> <span className="font-black uppercase">MediLog Public</span>
        </div>
        
        <Card className="p-8 text-center border-t-8 border-cyan-500">
           <Badge status={asset.status} />
           <h1 className="text-3xl font-black mt-4 text-slate-900">{asset.name}</h1>
           <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">{asset.brand}</p>
           
           <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
             <div>
               <p className="text-[10px] uppercase font-black text-slate-400">Last Service</p>
               <p className="font-bold text-slate-800">{asset.lastService}</p>
             </div>
             <div>
               <p className="text-[10px] uppercase font-black text-slate-400">Next Due</p>
               <p className="font-bold text-cyan-600">{asset.nextService}</p>
             </div>
           </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-black text-sm uppercase text-slate-400 mb-4">Service History</h3>
          <div className="space-y-4">
            {asset.history.map((h, i) => (
              <div key={i} className="flex gap-4 text-sm">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">{h.date}</p>
                  <p className="text-slate-500">{h.note} <span className="italic text-xs ml-1">- {h.tech}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={() => alert("Redirecting to Technician Login...")} className="w-full" variant="secondary" icon={Wrench}>Technician Login</Button>
      </div>
    </div>
  );
};

// --- 4. MAIN APP LOGIC ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [clinicType, setClinicType] = useState('dental');
  const [assets, setAssets] = useState([]);
  const [showPrint, setShowPrint] = useState(false);
  const [loading, setLoading] = useState(true);

  // Demo Data Generator
  const loadDemoData = (type) => {
    const devices = CLINIC_TYPES[type].devices;
    const demo = Array(6).fill(null).map((_, i) => ({
      id: `demo-${i}`,
      name: devices[i % devices.length],
      brand: ['Dentsply', 'A-dec', 'Carestream', 'Midmark'][i % 4],
      serial: `SN-${202400 + i}`,
      nextService: '2025-04-15',
      status: i === 0 ? 'critical' : i === 2 ? 'warning' : 'good'
    }));
    setAssets(demo);
  };

  useEffect(() => {
    // Check for Public Asset URL pattern
    if (window.location.pathname.includes('/asset/')) {
      setView('public');
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // In real app, fetch user's clinic type here
        setView('dashboard');
        loadDemoData('dental'); 
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center text-cyan-600 animate-pulse font-black">LOADING SYSTEM...</div>;

  if (view === 'public') return <PublicAssetPage assetId="123" />;
  if (view === 'landing') return <LandingPage onStart={() => setView('auth')} onDemo={() => { setClinicType('vet'); loadDemoData('vet'); setView('dashboard'); }} />;
  if (view === 'onboarding') return <Onboarding onComplete={(type) => { setClinicType(type); loadDemoData(type); setView('dashboard'); }} />;
  
  if (view === 'auth') {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md p-8">
          <button onClick={() => setView('landing')} className="mb-6 text-sm font-bold text-slate-400 hover:text-cyan-600">← Back</button>
          <h2 className="text-2xl font-black mb-2">Clinic Login</h2>
          <form onSubmit={(e) => { e.preventDefault(); setView('onboarding'); }} className="space-y-4">
             <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-cyan-500" required />
             <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-cyan-500" required />
             <Button className="w-full">Sign In / Register</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {showPrint && <PrintLayout assets={assets} onClose={() => setShowPrint(false)} />}
      
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 fixed h-full z-10">
        <div className="flex items-center gap-3 text-cyan-600 mb-12 px-2">
          <Stethoscope size={28} strokeWidth={3} />
          <span className="text-xl font-black tracking-tighter uppercase">MEDILOG</span>
        </div>
        
        <div className="px-4 py-3 bg-slate-50 rounded-xl mb-8 border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Clinic Type</p>
          <div className="flex items-center gap-2 font-bold">
            <span className="text-xl">{CLINIC_TYPES[clinicType].icon}</span>
            <span>{CLINIC_TYPES[clinicType].label}</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start text-cyan-600 bg-cyan-50" icon={LayoutDashboard}>Dashboard</Button>
          <Button variant="ghost" className="w-full justify-start" icon={History}>Maintenance Log</Button>
          <Button variant="ghost" className="w-full justify-start" icon={UserPlus}>Technicians</Button>
          <Button variant="ghost" className="w-full justify-start" icon={Settings}>Settings</Button>
        </nav>
        
        <Button variant="ghost" className="w-full justify-start text-rose-500 hover:bg-rose-50" icon={LogOut} onClick={() => setView('landing')}>Logout</Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Equipment Overview</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your assets and compliance status.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" icon={Printer} onClick={() => setShowPrint(true)}>Print Labels</Button>
             <Button icon={Plus}>Add Device</Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-l-4 border-rose-500">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><AlertTriangle size={24}/></div>
               <span className="text-3xl font-black">1</span>
             </div>
             <p className="font-bold text-slate-700">Maintenance Overdue</p>
             <p className="text-xs text-slate-400 mt-1">Requires immediate attention</p>
          </Card>
          <Card className="p-6 border-l-4 border-amber-500">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><History size={24}/></div>
               <span className="text-3xl font-black">2</span>
             </div>
             <p className="font-bold text-slate-700">Due This Month</p>
             <p className="text-xs text-slate-400 mt-1">Schedule service soon</p>
          </Card>
          <Card className="p-6 border-l-4 border-emerald-500">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><ShieldCheck size={24}/></div>
               <span className="text-3xl font-black">95%</span>
             </div>
             <p className="font-bold text-slate-700">Compliance Rate</p>
             <p className="text-xs text-slate-400 mt-1">Audit ready</p>
          </Card>
        </div>

        {/* Asset Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                <tr>
                  <th className="p-6">Asset Name</th>
                  <th className="p-6">Serial No.</th>
                  <th className="p-6">Next Service</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6 font-bold text-slate-800">{asset.name}</td>
                    <td className="p-6 text-sm font-medium text-slate-500">{asset.serial}</td>
                    <td className="p-6 text-sm font-bold text-slate-600">{asset.nextService}</td>
                    <td className="p-6"><Badge status={asset.status} /></td>
                    <td className="p-6 text-right">
                      <button className="text-slate-300 hover:text-cyan-600 transition-colors font-bold text-xs uppercase tracking-wider group-hover:text-cyan-600">View Details →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
