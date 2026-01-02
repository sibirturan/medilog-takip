import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Stethoscope, Printer, Plus, LogOut, Trash2, 
  Camera, Settings, CreditCard, CheckCircle2
} from 'lucide-react';

// --- DEMO VERİ (Firebase yerine) ---
const DEMO_USER = { uid: 'demo-user', email: 'demo@clinic.com' };
const DEMO_CLINIC = { name: 'Demo Klinik', phone: '0555 123 45 67', address: 'İstanbul, Türkiye' };

const PLANS = [
  { id: 'vet', name: 'Veterinary', price: 39, features: ['15 Cihaz Limiti', 'Aşı Takibi'] },
  { id: 'dental', name: 'Dental Clinic', price: 49, features: ['Sınırsız QR', 'Garanti Takibi'], recommended: true },
  { id: 'growth', name: 'Growth Package', price: 89, features: ['Çoklu Lokasyon', 'SMS Uyarıları'] }
];

// --- UI BİLEŞENLERİ ---
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = "button", disabled }) => {
  const styles = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-200",
    secondary: "bg-slate-800 text-white hover:bg-slate-900",
    outline: "bg-white text-slate-600 border-2 border-slate-100 hover:border-cyan-200 hover:text-cyan-600",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "bg-transparent"
  };
  
  return (
    <button 
      type={type} 
      disabled={disabled} 
      onClick={onClick} 
      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <input 
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all" 
      {...props} 
    />
  </div>
);

// --- ALT SAYFALAR ---
const SettingsView = ({ clinicData, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address')
    };
    
    await onSave(data);
    setMsg('Ayarlar kaydedildi!');
    setTimeout(() => setMsg(''), 3000);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-black text-slate-900 mb-8">Ayarlar</h2>
      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Klinik Adı" name="name" defaultValue={clinicData?.name || ''} required />
          <Input label="Telefon" name="phone" defaultValue={clinicData?.phone || ''} />
        </div>
        <Input label="Adres" name="address" defaultValue={clinicData?.address || ''} />
        {msg && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold text-center">{msg}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Button>
      </form>
    </div>
  );
};

const BillingView = ({ currentPlan, onUpgrade }) => (
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-black text-slate-900 mb-8">Planlar</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <div 
          key={plan.id} 
          className={`bg-white p-8 rounded-3xl border-2 ${plan.id === currentPlan ? 'border-cyan-500 ring-4 ring-cyan-50' : 'border-slate-100'} ${plan.recommended ? 'relative' : ''}`}
        >
          {plan.recommended && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-black px-4 py-1 rounded-full">
              ÖNERİLEN
            </div>
          )}
          <h3 className="text-xl font-black">{plan.name}</h3>
          <p className="text-3xl font-black my-4 text-slate-900">${plan.price}<span className="text-sm text-slate-400">/ay</span></p>
          <ul className="space-y-2 mb-8">
            {plan.features.map((f, i) => (
              <li key={i} className="text-sm font-bold text-slate-600 flex gap-2">
                <CheckCircle2 size={16} className="text-cyan-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button 
            onClick={() => onUpgrade(plan.id)} 
            disabled={plan.id === currentPlan} 
            className="w-full"
          >
            {plan.id === currentPlan ? 'Mevcut Plan' : 'Seç'}
          </Button>
        </div>
      ))}
    </div>
  </div>
);

// --- ANA UYGULAMA ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [assets, setAssets] = useState([]);
  const [clinicData, setClinicData] = useState(DEMO_CLINIC);
  const [userPlan, setUserPlan] = useState('dental');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogin = (email, pass) => {
    if (email && pass) {
      setUser(DEMO_USER);
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAssets([]);
    setView('landing');
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAsset = {
      id: Date.now().toString(),
      name: formData.get('name'),
      brand: formData.get('brand'),
      serial: formData.get('serial'),
      nextService: formData.get('nextService'),
      status: 'good',
      createdAt: new Date()
    };
    setAssets([newAsset, ...assets]);
    setIsAddModalOpen(false);
  };

  const handleDeleteAsset = (id) => {
    if (confirm('Bu cihazı silmek istediğinizden emin misiniz?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleSaveSettings = async (data) => {
    setClinicData(data);
  };

  const handleUpgrade = (planId) => {
    if (confirm(`Planı ${PLANS.find(p => p.id === planId)?.name} olarak değiştirmek istiyor musunuz?`)) {
      setUserPlan(planId);
    }
  };

  // --- LANDING PAGE ---
  if (view === 'landing' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white font-sans text-slate-900">
        <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-cyan-600 font-black text-xl">
            <Stethoscope /> MEDILOG
          </div>
          <button 
            onClick={() => setView('auth')} 
            className="font-bold text-slate-600 hover:text-cyan-600 transition-colors"
          >
            Giriş Yap
          </button>
        </nav>
        
        <header className="text-center py-24 px-6">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
            Klinik Yönetimi <br />
            <span className="text-cyan-600">Basitleştirildi.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Cihazlarınızı QR kod ile takip edin, bakım planlarını yönetin
          </p>
          <Button onClick={() => setView('auth')} className="px-10 py-5 text-lg">
            Hemen Başla
          </Button>
        </header>
      </div>
    );
  }

  // --- AUTH PAGE ---
  if (view === 'auth' && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-[2rem] shadow-xl">
          <div className="flex items-center justify-center gap-2 text-cyan-600 font-black text-2xl mb-8">
            <Stethoscope /> MEDILOG
          </div>
          <h2 className="text-2xl font-black text-center mb-6">Klinik Girişi</h2>
          
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleLogin(e.target.email.value, e.target.pass.value); 
            }} 
            className="space-y-4"
          >
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="pass" type="password" placeholder="Şifre" required />
            <Button type="submit" className="w-full">Giriş Yap</Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 mb-2">Demo için herhangi bir email/şifre girebilirsiniz</p>
            <button 
              onClick={() => setView('landing')} 
              className="text-sm text-cyan-600 font-bold hover:underline"
            >
              ← Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-2 text-cyan-600 font-black text-xl mb-10">
          <Stethoscope /> MEDILOG
        </div>
        
        <div className="mb-8 p-4 bg-slate-50 rounded-xl">
          <p className="text-[10px] font-black uppercase text-slate-400">Klinik</p>
          <p className="font-bold truncate">{clinicData?.name || 'Klinik Adı Yok'}</p>
          <p className="text-xs text-cyan-600 font-bold mt-1 uppercase">{userPlan} Plan</p>
        </div>

        <nav className="space-y-2 flex-1">
          <Button 
            variant="ghost" 
            onClick={() => setView('dashboard')} 
            className={`w-full justify-start ${view === 'dashboard' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`} 
            icon={LayoutDashboard}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('settings')} 
            className={`w-full justify-start ${view === 'settings' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`} 
            icon={Settings}
          >
            Ayarlar
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('billing')} 
            className={`w-full justify-start ${view === 'billing' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'}`} 
            icon={CreditCard}
          >
            Planlar
          </Button>
        </nav>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-rose-500 font-bold p-4 hover:bg-rose-50 rounded-xl transition-all text-sm w-full"
        >
          <LogOut size={16} /> Çıkış Yap
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {view === 'settings' && (
          <SettingsView clinicData={clinicData} onSave={handleSaveSettings} />
        )}
        
        {view === 'billing' && (
          <BillingView currentPlan={userPlan} onUpgrade={handleUpgrade} />
        )}
        
        {view === 'dashboard' && (
          <>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <h1 className="text-3xl font-black">Cihazlar ({assets.length})</h1>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  icon={Printer} 
                  onClick={() => window.print()}
                  className="hidden sm:flex"
                >
                  Yazdır
                </Button>
                <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                  Ekle
                </Button>
              </div>
            </header>

            {assets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Stethoscope size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-black text-slate-400 mb-2">Henüz Cihaz Yok</h3>
                <p className="text-sm text-slate-500 mb-6">Yeni cihaz ekleyerek başlayın</p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  İlk Cihazı Ekle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                  <div key={asset.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-4">
                      <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                        <Stethoscope size={20} />
                      </div>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                        AKTİF
                      </span>
                    </div>
                    
                    <h3 className="font-black text-lg mb-1">{asset.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mb-4">{asset.brand}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <p className="text-slate-600">
                        <span className="font-bold">Seri:</span> {asset.serial}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-bold">Bakım:</span> {asset.nextService}
                      </p>
                    </div>
                    
                    <div className="flex justify-center p-4 bg-slate-50 rounded-xl mb-4">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`MEDILOG-${asset.id}`)}`}
                        alt="QR Code"
                        className="w-24 h-24"
                      />
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteAsset(asset.id)} 
                      className="text-rose-500 hover:text-rose-600 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={14} /> SİL
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-black mb-6">Yeni Cihaz Ekle</h3>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <Input name="name" label="Cihaz Adı" placeholder="Örn: Ultrason Cihazı" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="brand" label="Marka" placeholder="Örn: Philips" required />
                <Input name="serial" label="Seri No" placeholder="ABC123" required />
              </div>
              <Input name="nextService" type="date" label="Sonraki Bakım" required />
              <div className="flex gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsAddModalOpen(false)}
                  type="button"
                >
                  İptal
                </Button>
                <Button type="submit" className="w-full">Kaydet</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @media print { 
          aside, header button, nav { display: none !important; } 
          .grid { display: grid !important; grid-template-columns: 1fr 1fr !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
