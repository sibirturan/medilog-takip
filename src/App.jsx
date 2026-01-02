import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, LayoutDashboard, Stethoscope, Settings, QrCode, Wrench, History, 
  LogOut, MoreVertical, AlertTriangle, CheckCircle2, Clock, ChevronRight, 
  Search, X, User, CreditCard, Save, TrendingUp, DollarSign, Activity, Zap, Sparkles,
  Shield, Smartphone, FileText, Check, ArrowRight, PlayCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, addDoc, onSnapshot, 
  query, orderBy, getDoc, setDoc, where 
} from 'firebase/firestore';

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
const appId = 'medilog-v2-professional';

// --- UI COMPONENTS (Medical Theme) ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-cyan-50 text-cyan-700 border border-cyan-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
    premium: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${variants[variant]}`}>{children}</span>;
};

// --- LANDING PAGE ---
const LandingPage = ({ onGetStarted, onTryDemo }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-cyan-600">
          <Stethoscope size={32} strokeWidth={2.5} />
          <span className="text-2xl font-black tracking-tighter uppercase">MEDILOG</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onTryDemo} className="hidden md:block px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors">Try Demo</button>
          <button onClick={onGetStarted} className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-black hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200">Start Free Trial</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <Badge variant="default">Now optimized for Dental & Vet Clinics</Badge>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mt-8 leading-[1.1] text-slate-900">
          Never Forget Your <span className="text-cyan-600">Equipment Maintenance</span> Again.
        </h1>
        <p className="text-xl text-slate-500 font-medium mt-8 leading-relaxed max-w-2xl mx-auto">
          The simplest way for small clinics to track service history, warranties, and compliance. Scan a QR code, record the fix, and move on.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
          <button onClick={onGetStarted} className="w-full md:w-auto px-10 py-5 bg-cyan-600 text-white rounded-2xl text-lg font-black shadow-2xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-3">
            Start Your 14-Day Free Trial <ArrowRight size={20} />
          </button>
          <button onClick={onTryDemo} className="w-full md:w-auto px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl text-lg font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
            <PlayCircle size={20} /> Watch Demo
          </button>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16 tracking-tight">Three simple steps to compliance.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl text-cyan-600 font-black text-2xl">1</div>
              <h3 className="text-xl font-black">Stick QR Labels</h3>
              <p className="text-slate-500 font-medium">Print and stick our custom QR labels on every medical device in your clinic.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl text-cyan-600 font-black text-2xl">2</div>
              <h3 className="text-xl font-black">Scan to Track</h3>
              <p className="text-slate-500 font-medium">Technicians scan the code with any mobile camera—no app download required.</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl text-cyan-600 font-black text-2xl">3</div>
              <h3 className="text-xl font-black">Stay Compliant</h3>
              <p className="text-slate-500 font-medium">Get automatic email alerts for maintenance, calibrations, and warranty expirations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-4 tracking-tighter">Simple Pricing for Every Clinic</h2>
        <p className="text-slate-500 text-center mb-16 font-medium">No hidden fees. Every plan includes a 14-day free trial.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard title="Dental Clinic" price="$49" devices="20" features={["Unlimited QR Labels", "Warranty Tracking", "Email Reminders"]} onSelect={onGetStarted} />
          <PricingCard title="Veterinary" price="$39" devices="15" features={["Vaccine Fridge Tracking", "Maintenance Alerts", "Email Support"]} featured onSelect={onGetStarted} />
          <PricingCard title="Growth Package" price="$89" devices="50" features={["2 Locations Supported", "SMS Notifications", "Priority Support"]} onSelect={onGetStarted} />
        </div>
      </section>
    </div>
  );
};

const PricingCard = ({ title, price, devices, features, featured = false, onSelect }) => (
  <Card className={`p-8 flex flex-col ${featured ? 'border-cyan-500 ring-4 ring-cyan-50' : ''}`}>
    {featured && <span className="w-fit px-3 py-1 bg-cyan-600 text-white text-[10px] font-black rounded-full mb-4 uppercase tracking-widest mx-auto">Most Popular</span>}
    <h3 className="text-2xl font-black text-slate-800 text-center">{title}</h3>
    <div className="flex items-baseline justify-center gap-1 my-6">
      <span className="text-5xl font-black">{price}</span>
      <span className="text-slate-400 font-bold">/mo</span>
    </div>
    <p className="text-center text-sm font-bold text-slate-500 mb-8 underline decoration-cyan-200">Up to {devices} devices included</p>
    <div className="space-y-4 mb-10 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Check size={18} className="text-cyan-600 shrink-0" /> {f}
        </div>
      ))}
    </div>
    <button onClick={onSelect} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${featured ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Try Free for 14 Days</button>
  </Card>
);

// --- MAIN APPLICATION ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState('landing'); // landing, auth, dashboard, public_asset
  const [isDemo, setIsDemo] = useState(false);
  const [view, setView] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setAppState('dashboard');
      } else if (!isDemo) {
        setAppState('landing');
      }
      setLoading(false);
    });
  }, [isDemo]);

  const startDemo = () => {
    setIsDemo(true);
    setAppState('dashboard');
    setAssets([
      { id: 'demo1', name: 'Digital X-Ray Sensor', brand: 'Dentsply', serial: 'DX-2024-88', nextMaintenance: '2026-03-15', status: 'Healthy' },
      { id: 'demo2', name: 'Autoclave Sterilizer', brand: 'Tuttnauer', serial: 'ST-992-B', nextMaintenance: '2026-01-10', status: 'Warning' },
      { id: 'demo3', name: 'Dental Chair Unit', brand: 'A-dec', serial: 'CH-450-V', nextMaintenance: '2025-12-20', status: 'Overdue' }
    ]);
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-black uppercase text-cyan-200">Syncing MediLog...</div>;

  if (appState === 'landing') return <LandingPage onGetStarted={() => setAppState('auth')} onTryDemo={startDemo} />;
  
  // Note: Reuse your existing AuthPage here but with the new styling
  if (appState === 'auth' && !user) return <AuthPage onBack={() => setAppState('landing')} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar (Updated Color) */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 p-10">
        <div className="flex items-center gap-3 text-cyan-600 mb-14 cursor-pointer" onClick={() => setView('dashboard')}>
          <Stethoscope size={28} strokeWidth={2.5} />
          <span className="text-2xl font-black tracking-tighter uppercase">MEDILOG</span>
        </div>
        
        {isDemo && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Demo Mode</p>
            <button onClick={() => setAppState('auth')} className="w-full py-2 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Create Full Account</button>
          </div>
        )}

        <nav className="space-y-2">
          <NavItem active={view === 'dashboard'} icon={<LayoutDashboard size={20}/>} label="Your Equipment" onClick={() => setView('dashboard')} />
          <NavItem active={view === 'inventory'} icon={<Wrench size={20}/>} label="Service History" onClick={() => setView('inventory')} />
          <NavItem active={view === 'settings'} icon={<Settings size={20}/>} label="Clinic Settings" onClick={() => setView('settings')} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 shrink-0">
          <h1 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{view.replace('_', ' ')}</h1>
          <div className="flex gap-4">
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg"><QrCode size={16} /> SCAN ASSET</button>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-xl hover:bg-cyan-700 transition-all"><Plus size={18} /> ADD DEVICE</button>
          </div>
        </header>

        {/* Content... reused from your code with visual tweaks */}
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black transition-all ${active ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-100' : 'text-slate-400 hover:bg-slate-50'}`}>{icon} <span className="uppercase tracking-widest">{label}</span></button>
);
