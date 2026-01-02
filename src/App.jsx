import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Stethoscope, Printer, Plus, LogOut, Trash2, 
  Search, X, CheckCircle2, Camera, Settings, CreditCard, 
  Menu, Edit, Home, AlertCircle, Building2, Phone, Mail, MapPin
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
const PLAN = {
  name: 'Professional',
  price: 29,
  trialDays: 14,
  features: [
    'Unlimited Devices',
    'QR Code Tracking',
    'Maintenance Reminders',
    'Priority Support',
    'Export Reports',
    'Multi-location Support'
  ]
};

const ASSET_STATUS = {
  GOOD: 'active',
  SERVICE: 'maintenance'
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

const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input 
        className={`w-full ${Icon ? 'pl-10' : ''} p-3 border-2 rounded-lg outline-none font-bold text-slate-700 transition-colors
          ${error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-cyan-500'}
          disabled:bg-slate-50 disabled:text-slate-400`} 
        {...props} 
      />
    </div>
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
    let html5QrCode = null;
    let mounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
        
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            if (mounted && html5QrCode) {
              html5QrCode.stop().then(() => onScan(decodedText)).catch(console.error);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera Error:", err);
        if (mounted) {
          setError("Camera access denied. Please check permissions.");
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center p-6">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-white font-bold mb-4">{error}</p>
          <Button onClick={onClose}>Close</Button>
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
            Scan QR Code
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
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'settings', icon: Settings, label: 'Settings' },
        { id: 'billing', icon: CreditCard, label: 'Billing' }
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

// ============ SETTINGS VIEW ============

const SettingsView = ({ user, clinicData, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: clinicData?.name || '',
    phone: clinicData?.phone || '',
    address: clinicData?.address || ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/settings/profile`), {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Settings</h2>
        <p className="text-slate-500">Manage your clinic information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <Building2 size={40} />
            </div>
            <h3 className="text-xl font-black mb-1">{formData.name || 'Your Clinic'}</h3>
            <p className="text-cyan-100 text-sm font-bold mb-4">{user.email}</p>
            <div className="pt-4 border-t border-cyan-400/30">
              <div className="flex items-center gap-2 text-sm mb-2">
                <CheckCircle2 size={16} />
                <span className="font-bold">Professional Plan</span>
              </div>
              <p className="text-xs text-cyan-100">Active subscription</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-cyan-600" />
              Clinic Information
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <Input 
                label="Clinic Name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                icon={Building2}
                placeholder="Enter clinic name"
                required 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Phone Number" 
                  name="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                  icon={Phone}
                  placeholder="+1 (555) 000-0000"
                />
                <Input 
                  label="Email Address" 
                  value={user.email} 
                  icon={Mail}
                  disabled 
                />
              </div>
              
              <Input 
                label="Address" 
                name="address" 
                value={formData.address}
                onChange={handleChange}
                icon={MapPin}
                placeholder="Enter clinic address"
              />

              {/* Account Info */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-600 uppercase tracking-wide mb-4">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Account Status</p>
                    <p className="font-black text-emerald-600">Active</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Member Since</p>
                    <p className="font-black text-slate-800">
                      {user.metadata.creationTime ? 
                        new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setFormData({
                    name: clinicData?.name || '',
                    phone: clinicData?.phone || '',
                    address: clinicData?.address || ''
                  })}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={loading} icon={loading ? null : CheckCircle2}>
                  {loading ? <><LoadingSpinner size="sm" /> Saving...</> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ BILLING VIEW ============

const BillingView = ({ userSubscription, onSubscribe }) => {
  const isSubscribed = userSubscription?.status === 'active';
  const trialEndsAt = userSubscription?.trialEndsAt;
  const isInTrial = trialEndsAt && new Date(trialEndsAt) > new Date();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Billing & Subscription</h2>
        <p className="text-slate-500">Manage your subscription and payment details</p>
      </div>

      {/* Current Status */}
      {isSubscribed && (
        <div className={`mb-6 p-6 rounded-2xl border-2 ${isInTrial ? 'bg-cyan-50 border-cyan-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={isInTrial ? 'text-cyan-600' : 'text-emerald-600'} size={24} />
                <h3 className="text-lg font-black text-slate-800">
                  {isInTrial ? 'Free Trial Active' : 'Subscription Active'}
                </h3>
              </div>
              <p className="text-slate-600 font-bold">
                {isInTrial 
                  ? `Your trial ends on ${new Date(trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : 'You have full access to all features'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black mb-2">{PLAN.name} Plan</h3>
              <p className="text-cyan-100 font-bold">Everything you need to manage your clinic</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black">${PLAN.price}</p>
              <p className="text-cyan-100 font-bold">/month</p>
            </div>
          </div>
          
          {!isSubscribed && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              <p className="text-sm font-black">🎉 {PLAN.trialDays} Days Free Trial</p>
            </div>
          )}
        </div>

        <div className="p-8">
          <h4 className="text-sm font-black text-slate-600 uppercase tracking-wide mb-4">
            What's Included
          </h4>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {PLAN.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="text-cyan-600" size={16} />
                </div>
                <span className="font-bold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={onSubscribe}
            disabled={isSubscribed}
            className="w-full"
            size="lg"
          >
            {isSubscribed 
              ? '✓ Subscribed' 
              : `Start ${PLAN.trialDays}-Day Free Trial`}
          </Button>

          {!isSubscribed && (
            <p className="text-center text-xs text-slate-400 mt-4">
              No credit card required for trial. Cancel anytime.
            </p>
          )}
        </div>
      </div>

      {/* Payment Info */}
      {isSubscribed && !isInTrial && (
        <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="font-black text-slate-800 mb-4">Payment Method</h4>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="text-slate-400" size={24} />
              <div>
                <p className="font-bold text-slate-800">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ ASSET CARD ============

const AssetCard = ({ asset, onDelete, onEdit }) => {
  const isOverdue = asset.nextService && new Date(asset.nextService) < new Date();
  
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
          <Stethoscope size={24} />
        </div>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-600">
              Overdue
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase 
            ${asset.status === ASSET_STATUS.GOOD ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {asset.status === ASSET_STATUS.GOOD ? 'Active' : 'Maintenance'}
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
          <p className="font-bold text-slate-400 uppercase">Next Service</p>
          <p className={`font-bold ${isOverdue ? 'text-amber-600' : 'text-slate-800'}`}>
            {asset.nextService ? new Date(asset.nextService).toLocaleDateString('en-US') : 'Not set'}
          </p>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(asset)}
            className="text-slate-300 hover:text-cyan-500 p-2 transition-colors"
            aria-label="Edit device"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(asset)}
            className="text-slate-300 hover:text-rose-500 p-2 transition-colors"
            aria-label="Delete device"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MODALS ============

const AssetModal = ({ asset, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!asset?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            {isEdit ? 'Edit Device' : 'Add New Device'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input name="name" label="Device Name" defaultValue={asset?.name} placeholder="e.g., X-Ray Machine" required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="brand" label="Brand" defaultValue={asset?.brand} placeholder="e.g., Siemens" required />
            <Input name="serial" label="Serial Number" defaultValue={asset?.serial} placeholder="e.g., SN123456" required />
          </div>
          <Input name="nextService" type="date" label="Next Service Date" defaultValue={asset?.nextService} required />
          
          {isEdit && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Status</label>
              <select 
                name="status" 
                defaultValue={asset?.status}
                className="w-full p-3 border-2 border-slate-200 rounded-lg font-bold text-slate-700 focus:border-cyan-500 outline-none"
              >
                <option value={ASSET_STATUS.GOOD}>Active</option>
                <option value={ASSET_STATUS.SERVICE}>Maintenance</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="w-full" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : (isEdit ? 'Update' : 'Save')}
            </Button>
          </div>
        </form>
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
        <Button variant="outline" className="w-full" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="danger" className="w-full" onClick={onConfirm} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Delete'}
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
          throw new Error('Password must be at least 6 characters');
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const messages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak'
      };
      setError(messages[e.code] || e.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('');
      alert('Password reset link sent to your email');
    } catch (e) {
      setError('Failed to send reset email');
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
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email"
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            icon={Mail}
            required
          />
          <Input 
            type="password" 
            placeholder="Password" 
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
            {loading ? <LoadingSpinner size="sm" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
        
        {isLogin && (
          <button 
            onClick={handleResetPassword}
            className="w-full text-center text-sm text-slate-400 font-bold mt-4 hover:text-cyan-600"
          >
            Forgot Password?
          </button>
        )}
        
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-bold text-cyan-600"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
        
        <button 
          onClick={onBack}
          className="w-full mt-4 text-xs text-slate-400 font-bold hover:text-slate-600"
        >
          ← Back to Home
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
        Sign In
      </button>
    </nav>
    
    <header className="text-center py-16 md:py-24 px-6">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
        Medical Device Tracking <br/>
        <span className="text-cyan-600">Made Simple.</span>
      </h1>
      <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-8">
        Track your clinic devices with QR codes. Never miss maintenance schedules again.
      </p>
      <Button onClick={onStart} size="lg" className="shadow-xl shadow-cyan-200">
        Start Free Trial
      </Button>
      <p className="text-slate-400 text-sm mt-4 font-bold">
        14 days free • No credit card required
      </p>
    </header>
    
    <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
      {[
        { icon: Camera, title: 'QR Code Scanning', desc: 'Instantly identify devices' },
        { icon: CheckCircle2, title: 'Maintenance Tracking', desc: 'Get timely reminders' },
        { icon: Stethoscope, title: 'Clinic Focused', desc: 'Built for healthcare' }
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
  const [userSubscription, setUserSubscription] = useState(null);
  
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
            const data = snap.data();
            setClinicData(data);
            if (data.subscription) {
              setUserSubscription(data.subscription);
            }
          }
        } catch (e) {
          console.error('Profile fetch error:', e);
        }
        setView('dashboard');
      } else {
        setUser(null);
        setClinicData(null);
        setAssets([]);
        setUserSubscription(null);
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
      showToast('Failed to load devices', 'error');
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
        showToast('Device updated successfully');
      } else {
        await addDoc(collection(db, `users/${user.uid}/assets`), {
          name: data.name,
          brand: data.brand,
          serial: data.serial,
          nextService: data.nextService,
          status: data.status || ASSET_STATUS.GOOD,
          createdAt: serverTimestamp()
        });
        showToast('Device added successfully');
      }
      setIsModalOpen(false);
      setModalAsset(null);
    } catch (e) {
      console.error('Save error:', e);
      showToast('Error: ' + e.message, 'error');
    }
  };

  const handleDeleteAsset = async () => {
    if (!deleteAsset?.id) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/assets`, deleteAsset.id));
      showToast('Device deleted successfully');
      setDeleteAsset(null);
    } catch (e) {
      console.error('Delete error:', e);
      showToast('Delete failed', 'error');
    }
    setActionLoading(false);
  };

  const handleSubscribe = async () => {
    if (!confirm(`Start ${PLAN.trialDays}-day free trial? (Demo mode)`)) return;
    try {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + PLAN.trialDays);
      
      await setDoc(doc(db, `users/${user.uid}/settings/profile`), { 
        subscription: {
          status: 'active',
          plan: 'professional',
          trialEndsAt: trialEnd.toISOString(),
          startedAt: new Date().toISOString()
        }
      }, { merge: true });
      
      setUserSubscription({
        status: 'active',
        plan: 'professional',
        trialEndsAt: trialEnd.toISOString()
      });
      
      showToast('Trial started successfully!');
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  const handleScan = useCallback((txt) => {
    setIsScannerOpen(false);
    const found = assets.find(a => txt.includes(a.id));
    if (found) {
      setModalAsset(found);
      setIsModalOpen(true);
    } else {
      showToast('Device not found', 'error');
    }
  }, [assets, showToast]);

  const filteredAssets = useMemo(() => 
    assets.filter(a => 
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serial?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [assets, searchQuery]
  );

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Stethoscope className="text-cyan-600 mb-4" size={48} />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (view === 'landing' && !user) {
    return <LandingPage onStart={() => setView('auth')} />;
  }

  if (view === 'auth' && !user) {
    return <AuthScreen onBack={() => setView('landing')} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {isScannerOpen && <QRScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />}
      {isModalOpen && (
        <AssetModal 
          asset={modalAsset}
          onClose={() => { setIsModalOpen(false); setModalAsset(null); }}
          onSave={handleSaveAsset}
        />
      )}
      {deleteAsset && (
        <ConfirmModal
          title="Delete Device"
          message={`Are you sure you want to delete "${deleteAsset.name}"?`}
          onConfirm={handleDeleteAsset}
          onCancel={() => setDeleteAsset(null)}
          loading={actionLoading}
        />
      )}
      
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-2 text-cyan-600 font-black text-xl mb-10">
          <Stethoscope strokeWidth={3} /> MEDILOG
        </div>
        
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400">Clinic</p>
          <p className="font-bold truncate">{clinicData?.name || 'Your Clinic'}</p>
          <p className="text-xs text-cyan-600 font-bold mt-1 uppercase">
            {userSubscription?.status === 'active' ? 'Professional' : 'Free Trial'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {assets.length} devices
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
            Settings
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setView('billing')} 
            className={`w-full justify-start ${view === 'billing' ? 'bg-cyan-50 text-cyan-700' : ''}`} 
            icon={CreditCard}
          >
            Billing
          </Button>
        </nav>
        
        <button 
          onClick={() => signOut(auth)} 
          className="flex items-center gap-2 text-rose-500 font-bold p-4 hover:bg-rose-50 rounded-xl transition-all text-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto min-h-screen">
        <div className="lg:hidden flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-cyan-600 font-black text-xl">
            <Stethoscope strokeWidth={3} /> MEDILOG
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="text-slate-400" size={20} />
          </button>
        </div>

        {view === 'settings' && <SettingsView user={user} clinicData={clinicData} showToast={showToast} />}
        {view === 'billing' && <BillingView userSubscription={userSubscription} onSubscribe={handleSubscribe} />}
        
        {view === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black">Devices</h1>
                <p className="text-slate-400 text-sm font-bold">
                  {assets.length} device{assets.length !== 1 ? 's' : ''} registered
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
                  <span className="hidden sm:inline">Scan QR</span>
                </Button>
                <Button 
                  variant="outline" 
                  icon={Printer} 
                  onClick={() => window.print()} 
                  className="flex-1 md:flex-none"
                  size="sm"
                >
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button 
                  icon={Plus} 
                  onClick={() => { setModalAsset(null); setIsModalOpen(true); }} 
                  className="flex-1 md:flex-none"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </header>

            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-cyan-500 transition-colors" 
                placeholder="Search devices, brand or serial..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Stethoscope className="text-slate-200 mx-auto mb-4" size={48} />
                <h3 className="font-black text-slate-400 mb-2">No Devices Yet</h3>
                <p className="text-slate-300 text-sm mb-4">Add your first device to get started</p>
                <Button onClick={() => { setModalAsset(null); setIsModalOpen(true); }} icon={Plus}>
                  Add First Device
                </Button>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <Search className="text-slate-200 mx-auto mb-4" size={48} />
                <h3 className="font-black text-slate-400">No Results Found</h3>
                <p className="text-slate-300 text-sm">No devices match "{searchQuery}"</p>
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

      <MobileBottomNav view={view} setView={setView} />
      
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
        html, body { 
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
        }
        main::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
}
