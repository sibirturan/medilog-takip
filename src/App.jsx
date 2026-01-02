import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Stethoscope, Printer, Plus, LogOut, Trash2, 
  Search, X, CheckCircle2, Camera, Settings, CreditCard, 
  Menu, Edit, Home, AlertCircle
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode'; 
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, onSnapshot, query, orderBy, deleteDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Firebase Config - Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Constants
const PLANS = {
  free: { name: 'Ücretsiz', limit: 5, price: 0 },
  vet: { name: 'Veterinary', limit: 15, price: 39 },
  dental: { name: 'Dental Clinic', limit: 20, price: 49 },
  growth: { name: 'Growth Package', limit: 50, price: 89 }
};

const PLAN_LIST = [
  { id: 'vet', ...PLANS.vet, features: ['15 Cihaz Limiti', 'Aşı Takibi', 'Email Destek'] },
  { id: 'dental', ...PLANS.dental, features: ['20 Cihaz Limiti', 'Garanti Takibi', 'Sınırsız QR'], recommended: true },
  { id: 'growth', ...PLANS.growth, features: ['50 Cihaz Limiti', 'Çoklu Lokasyon', 'SMS Bildirimleri'] }
];

const ASSET_STATUS = {
  GOOD: 'good',
  SERVICE: 'service'
};

// ============ UI COMPONENTS ============

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = "button", disabled, size = 'md' }) => {
  const styles = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 shadow-sm",
    outline: "bg-white text-slate-700 border-2 border-slate-200 hover:border-cyan-500 active:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700",
    ghost: "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  return (
    <button 
      type={type} 
      disabled={disabled} 
      onClick={onClick} 
      className={`flex items-center justify-center gap-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-bold text-slate-600 uppercase">{label}</label>}
    <input 
      className={`w-full p-3 border-2 rounded-lg outline-none font-bold text-slate-700 transition-colors
        ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-cyan-500'}
        disabled:bg-slate-50 disabled:text-slate-400`} 
      {...props} 
    />
    {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
  </div>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-cyan-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-[300] ${styles[type]} text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-slide-in`}>
      {type === 'success' && <CheckCircle2 size={20} />}
      {type === 'error' && <AlertCircle size={20} />}
      {message}
    </div>
  );
};

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin`} />
  );
};

// ============ QR SCANNER ============

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
    
    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      (decodedText) => {
        html5QrCode.stop().then(() => onScan(decodedText));
      },
      () => {}
    ).catch(err => {
      console.error("Camera Error:", err);
      setError("Kamera açılamadı. Lütfen kamera izinlerini kontrol edin.");
    });

    return () => {
      if(html5QrCode.isScanning) html5QrCode.stop().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center p-6">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-white font-bold mb-4">{error}</p>
          <Button onClick={onClose}>Kapat</Button>
        </div>
      ) : (
        <>
          <div id="reader" className="w-full h-full" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-4 border-cyan-500 rounded-2xl animate-pulse" />
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 safe-area-inset bg-black/50 text-white p-3 rounded-full hover:bg-black/70 backdrop-blur-md z-50"
          >
            <X size={24} />
          </button>
          <p className="absolute bottom-10 safe-area-inset text-white font-bold bg-black/50 px-4 py-2 rounded-full">
            QR Kodu Okutun
          </p>
        </>
      )}
    </div>
  );
};

// ============ MOBILE BOTTOM NAV ============

const MobileBottomNav = ({ view, setView }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset">
    <div className="flex justify-around items-center h-16">
      {[
        { id: 'dashboard', icon: Home, label: 'Ana Sayfa' },
        { id: 'settings', icon: Settings, label: 'Ayarlar' },
        { id: 'billing', icon: CreditCard, label: 'Planlar' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors
            ${view === item.id ? 'text-cyan-600' : 'text-slate-400'}`}
        >
          <item.icon size={22} strokeWidth={view === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  </nav>
);

// ============ VIEWS ============

const SettingsView = ({ user, clinicData, showToast }) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/settings/profile`), {
        name: e.target.name.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showToast('Ayarlar kaydedildi!', 'success');
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Ayarlar</h2>
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <Input label="Klinik Adı" name="name" defaultValue={clinicData?.name || ''} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefon" name="phone" type="tel" defaultValue={clinicData?.phone || ''} />
            <Input label="Email" value={user.email} disabled />
          </div>
          <Input label="Adres" name="address" defaultValue={clinicData?.address || ''} />
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} icon={loading ? null : CheckCircle2}>
              {loading ? <><LoadingSpinner size="sm" /> Kaydediliyor...</> : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BillingView = ({ currentPlan, onUpgrade }) => (
  <div className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-black text-slate-800 mb-6">Planlar</h2>
    <div className="grid md:grid-cols-3 gap-6">
      {PLAN_LIST.map((plan) => (
        <div 
          key={plan.id} 
          className={`bg-white p-6 rounded-2xl border-2 transition-all
            ${plan.id === currentPlan ? 'border-cyan-500 shadow-lg scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}`}
        >
          {plan.recommended && (
            <span className="bg-cyan-600 text-white text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest">
              Önerilen
            </span>
          )}
          <h3 className="text-lg font-black mt-2">{plan.name}</h3>
          <p className="text-3xl font-black my-3 text-slate-900">
            ${plan.price}<span className="text-sm text-slate-400 font-bold">/ay</span>
          </p>
          <ul className="space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="text-sm flex gap-2 items-center text-slate-600 font-bold">
                <CheckCircle2 size={16} className="text-cyan-500 flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
          <Button 
            onClick={() => onUpgrade(plan.id)} 
            disabled={plan.id === currentPlan} 
            className="w-full"
            variant={plan.id === currentPlan ? 'outline' : 'primary'}
          >
            {plan.id === currentPlan ? '✓ Mevcut Plan' : 'Seç'}
          </Button>
        </div>
      ))}
    </div>
  </div>
);

// ============ ASSET CARD ============

const AssetCard = ({ asset, onDelete, onEdit }) => {
  const isOverdue = new Date(asset.nextService) < new Date();
  
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
          <Stethoscope size={24} />
        </div>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-600">
              Gecikmiş
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase 
            ${asset.status === ASSET_STATUS.GOOD ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {asset.status === ASSET_STATUS.GOOD ? 'Aktif' : 'Servis'}
          </span>
        </div>
      </div>
      
      <h3 className="text-lg font-black text-slate-800 truncate">{asset.name}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{asset.brand}</p>
      <p className="text-xs text-slate-300 font-mono mb-4">SN: {asset.serial}</p>
      
      <div className="flex justify-center mb-4 p-3 bg-slate-50 rounded-xl">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`medilog:${asset.id}`)}`} 
          alt="QR Code"
          className="w-20 h-20"
          loading="lazy"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs">
          <p className="font-bold text-slate-400 uppercase">Sonraki Bakım</p>
          <p className={`font-bold ${isOverdue ? 'text-amber-600' : 'text-slate-800'}`}>
            {new Date(asset.nextService).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(asset)}
            className="text-slate-300 hover:text-cyan-500 p-2 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(asset)}
            className="text-slate-300 hover:text-rose-500 p-2 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MODALS ============

const AssetModal = ({ asset, onClose, onSave, userPlan, assetCount }) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!asset?.id;
  const limit = PLANS[userPlan]?.limit || 5;
  const isOverLimit = !isEdit && assetCount >= limit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOverLimit) return;
    
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      id: asset?.id,
      name: fd.get('name'),
      brand: fd.get('brand'),
      serial: fd.get('serial'),
      nextService: fd.get('nextService'),
      status: fd.get('status') || ASSET_STATUS.GOOD
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">
            {isEdit ? 'Cihazı Düzenle' : 'Yeni Cihaz'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="text-slate-400" />
          </button>
        </div>
        
        {isOverLimit ? (
          <div className="p-6 text-center">
            <AlertCircle className="text-amber-500 mx-auto mb-4" size={48} />
            <h4 className="font-black text-lg mb-2">Cihaz Limitine Ulaştınız</h4>
            <p className="text-slate-500 mb-4">
              {userPlan === 'free' ? 'Ücretsiz' : PLANS[userPlan].name} planında maksimum {limit} cihaz ekleyebilirsiniz.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">Planları İncele</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Input name="name" label="Cihaz Adı" defaultValue={asset?.name} required />
            <div className="grid grid-cols-2 gap-4">
              <Input name="brand" label="Marka" defaultValue={asset?.brand} required />
              <Input name="serial" label="Seri No" defaultValue={asset?.serial} required />
            </div>
            <Input name="nextService" type="date" label="Sonraki Bakım" defaultValue={asset?.nextService} required />
            
            {isEdit && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Durum</label>
                <select 
                  name="status" 
                  defaultValue={asset?.status}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg font-bold text-slate-700"
                >
                  <option value={ASSET_STATUS.GOOD}>Aktif</option>
                  <option value={ASSET_STATUS.SERVICE}>Serviste</option>
                </select>
              </div>
            )}
            
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="w-full" onClick={onClose} type="button">İptal</Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : (isEdit ? 'Güncelle' : 'Kaydet')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl">
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" className="w-full" onClick={onCancel} disabled={loading}>İptal</Button>
        <Button variant="danger" className="w-full" onClick={onConfirm} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Sil'}
        </Button>
      </div>
    </div>
  </div>
);

// ============ AUTH SCREENS ============

const AuthScreen = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password.length < 6) {
          throw new Error('Şifre en az 6 karakter olmalı');
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const messages = {
        'auth/invalid-email': 'Geçersiz email adresi',
        'auth/user-not-found': 'Kullanıcı bulunamadı',
        'auth/wrong-password': 'Hatalı şifre',
        'auth/email-already-in-use': 'Bu email zaten kullanımda',
        'auth/weak-password': 'Şifre çok zayıf'
      };
      setError(messages[e.code] || e.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Şifre sıfırlamak için email adresinizi girin');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('');
      alert('Şifre sıfırlama linki email adresinize gönderildi');
    } catch (e) {
      setError('Email gönderilemedi');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl">
        <div className="flex items-center justify-center gap-2 text-cyan-600 font-black text-2xl mb-8">
          <Stethoscope strokeWidth={3} />
          MEDILOG
        </div>
        
        <h2 className="text-2xl font-black text-center mb-6">
          {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email"
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password" 
            placeholder="Şifre" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold text-center border border-rose-100">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </Button>
        </form>
        
        {isLogin && (
          <button 
            onClick={handleResetPassword}
            className="w-full text-center text-sm text-slate-400 font-bold mt-4 hover:text-cyan-600"
          >
            Şifremi Unuttum
          </button>
        )}
        
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-bold text-cyan-600"
          >
            {isLogin ? 'Hesabınız yok mu? Kayıt Olun' : 'Zaten hesabınız var mı? Giriş Yapın'}
          </button>
        </div>
        
        <button 
          onClick={onBack}
          className="w-full mt-4 text-xs text-slate-400 font-bold hover:text-slate-600"
        >
          ← Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
};

const LandingPage = ({ onStart }) => (
  <div className="min-h-screen bg-white font-sans text-slate-900">
    <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-cyan-600 font-black text-xl">
        <Stethoscope strokeWidth={3} /> MEDILOG
      </div>
      <button onClick={onStart} className="font-bold text-slate-600 hover:text-cyan-600 transition-colors">
        Giriş
      </button>
    </nav>
    
    <header className="text-center py-16 md:py-24 px-6">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
        Klinik Cihaz Takibi <br/>
        <span className="text-cyan-600">Kolaylaştı.</span>
      </h1>
      <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-8">
        QR kod ile cihazlarınızı takip edin, bakım zamanlarını kaçırmayın.
      </p>
      <Button onClick={onStart} size="lg" className="shadow-xl shadow-cyan-200">
        Hemen Başla
      </Button>
    </header>
    
    <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
      {[
        { icon: Camera, title: 'QR Kod Tarama', desc: 'Cihazları anında tanımlayın' },
        { icon: CheckCircle2, title: 'Bakım Takibi', desc: 'Zamanında hatırlatmalar alın' },
        { icon: Stethoscope, title: 'Klinik Odaklı', desc: 'Sağlık sektörüne özel çözüm' }
      ].map((item, i) => (
        <div key={i} className="text-center p-6">
          <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <item.icon size={32} />
          </div>
          <h3 className="font-black text-lg mb-2">{item.title}</h3>
          <p className="text-slate-500">{item.desc}</p>
        </div>
      ))}
    </section>
  </div>
);

// ============ MAIN APP ============

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [assets, setAssets] = useState([]);
  const [clinicData, setClinicData] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [modalAsset, setModalAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteAsset, setDeleteAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, `users/${u.uid}/settings/profile`));
          if (snap.exists()) {
            setClinicData(snap.data());
            if (snap.data().plan) setUserPlan(snap.data().plan);
          }
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
        setView('dashboard');
      } else {
        setUser(null);
        setClinicData(null);
        setAssets([]);
        setUserPlan('free');
        setView('landing');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Assets listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/assets`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error('Assets fetch error:', error);
      showToast('Cihazlar yüklenemedi', 'error');
    });
  }, [user, showToast]);

  const handleSaveAsset = async (data) => {
    try {
      if (data.id) {
        await updateDoc(doc(db, `users/${user.uid}/assets`, data.id), {
          name: data.name,
          brand: data.brand,
          serial: data.serial,
          nextService: data.nextService,
          status: data.status,
          updatedAt: serverTimestamp()
        });
        showToast('Cihaz güncellendi');
      } else {
        await addDoc(collection(db, `users/${user.uid}/assets`), {
          ...data,
          createdAt: serverTimestamp()
        });
        showToast('Cihaz eklendi');
      }
      setIsModalOpen(false);
      setModalAsset(null);
    } catch (e) {
      showToast('Hata: ' + e.message, 'error');
    }
  };

  const handleDeleteAsset = async () => {
    if (!deleteAsset) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/assets`, deleteAsset.id));
      showToast('Cihaz silindi');
      setDeleteAsset(null);
    } catch (e) {
      showToast('Silme hatası', 'error');
    }
    setActionLoading(false);
  };

  const handleUpgrade = async (planId) => {
    // TODO: Gerçek ödeme entegrasyonu (Stripe/Iyzico)
    if (!confirm(`${PLANS[planId].name} planına geçmek istiyor musunuz? (Demo mod)`)) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/settings/profile`), { plan: planId }, { merge: true });
      setUserPlan(planId);
      showToast('Plan güncellendi');
    } catch (e) {
      showToast('Hata: ' + e.message, 'error');
    }
  };

  const handleScan = useCallback((txt) => {
    setIsScannerOpen(false);
    const found = assets.find(a => txt.includes(a.id));
    if (found) {
      setModalAsset(found);
      setIsModalOpen(true);
    } else {
      showToast('Cihaz bulunamadı', 'error');
    }
  }, [assets, showToast]);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Stethoscope className="text-cyan-600 mb-4" size={48} />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Landing page
  if (view === 'landing' && !user) {
    return <LandingPage onStart={() => setView('auth')} />;
  }

  // Auth screen
  if (view === 'auth' && !user) {
    return <AuthScreen onBack={() => setView('landing')} />;
  }

  if (!user) return null;

  // Main app
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* QR Scanner */}
      {isScannerOpen && <QRScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />}
      
      {/* Asset Modal */}
      {isModalOpen && (
        <AssetModal 
          asset={modalAsset}
          onClose={() => { setIsModalOpen(false); setModalAsset(null); }}
          onSave={handleSaveAsset}
          userPlan={userPlan}
          assetCount={assets.length}
        />
      )}
      
      {/* Delete Confirm */}
      {deleteAsset && (
        <ConfirmModal
          title="Cihazı Sil"
          message={`"${deleteAsset.name}" cihazını silmek istediğinize emin misiniz?`}
          onConfirm={handleDeleteAsset}
          onCancel={() => setDeleteAsset(null)}
          loading={actionLoading}
        />
      )}
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-2 text-cyan-600 font-black text-xl mb-10">
          <Stethoscope strokeWidth={3} /> MEDILOG
        </div>
        
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400">Klinik</p>
          <p className="font-bold truncate">{clinicData?.name || 'İsimsiz Klinik'}</p>
          <p className="text-xs text-cyan-600 font-bold mt-1 uppercase">{PLANS[userPlan]?.name || 'Free'}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {assets.length} / {PLANS[userPlan]?.limit || 5} cihaz
          </p>
        </div>

        <nav className="space-y-2 flex-1">
          <Button 
            variant="ghost" 
            onClick={() => setView('dashboard')} 
            className={`w-full justify-start ${view === 'dashboard' ? 'bg-cyan-50 text-cyan-700' : ''}`} 
            icon={LayoutDashboard}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('settings')} 
            className={`w-full justify-start ${view === 'settings' ? 'bg-cyan-50 text-cyan-700' : ''}`} 
            icon={Settings}
          >
            Ayarlar
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('billing')} 
            className={`w-full justify-start ${view === 'billing' ? 'bg-cyan-50 text-cyan-700' : ''}`} 
            icon={CreditCard}
          >
            Planlar
          </Button>
        </nav>
        
        <button 
          onClick={() => signOut(auth)} 
          className="flex items-center gap-2 text-rose-500 font-bold p-4 hover:bg-rose-50 rounded-xl transition-all text-sm"
        >
          <LogOut size={16} /> Çıkış Yap
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-cyan-600 font-black text-xl">
            <Stethoscope strokeWidth={3} /> MEDILOG
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <LogOut className="text-slate-400" size={20} />
          </button>
        </div>

        {view === 'settings' && <SettingsView user={user} clinicData={clinicData} showToast={showToast} />}
        {view === 'billing' && <BillingView currentPlan={userPlan} onUpgrade={handleUpgrade} />}
        
        {view === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black">Cihazlar</h1>
                <p className="text-slate-400 text-sm font-bold">
                  {assets.length} / {PLANS[userPlan]?.limit || 5} cihaz kullanılıyor
                </p>
              </div>
              <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  icon={Camera} 
                  onClick={() => setIsScannerOpen(true)} 
                  className="flex-1 md:flex-none"
                  size="sm"
                >
                  <span className="hidden sm:inline">QR Tara</span>
                </Button>
                <Button 
                  variant="outline" 
                  icon={Printer} 
                  onClick={() => window.print()} 
                  className="flex-1 md:flex-none"
                  size="sm"
                >
                  <span className="hidden sm:inline">Yazdır</span>
                </Button>
                <Button 
                  icon={Plus} 
                  onClick={() => { setModalAsset(null); setIsModalOpen(true); }} 
                  className="flex-1 md:flex-none"
                  size="sm"
                >
                  Ekle
                </Button>
              </div>
            </header>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-cyan-500 transition-colors" 
                placeholder="Cihaz, marka veya seri no ara..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Asset Grid */}
            {assets.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Stethoscope className="text-slate-200 mx-auto mb-4" size={48} />
                <h3 className="font-black text-slate-400 mb-2">Henüz Cihaz Yok</h3>
                <p className="text-slate-300 text-sm mb-4">İlk cihazınızı ekleyerek başlayın</p>
                <Button onClick={() => { setModalAsset(null); setIsModalOpen(true); }} icon={Plus}>
                  İlk Cihazı Ekle
                </Button>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <Search className="text-slate-200 mx-auto mb-4" size={48} />
                <h3 className="font-black text-slate-400">Sonuç Bulunamadı</h3>
                <p className="text-slate-300 text-sm">"{searchQuery}" ile eşleşen cihaz yok</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredAssets.map(asset => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset}
                    onEdit={(a) => { setModalAsset(a); setIsModalOpen(true); }}
                    onDelete={(a) => setDeleteAsset(a)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav view={view} setView={setView} />
      
      {/* Global Styles */}
      <style>{`
        @media print { 
          aside, nav, header, button, .max-w-md, [class*="fixed"] { display: none !important; } 
          .grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 1cm; } 
          main { padding: 0 !important; }
        }
        
        .safe-area-inset { 
          padding-top: env(safe-area-inset-top); 
          padding-bottom: env(safe-area-inset-bottom); 
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        /* iOS bounce fix */
        html, body { 
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide scrollbar but keep functionality */
        main::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
}
