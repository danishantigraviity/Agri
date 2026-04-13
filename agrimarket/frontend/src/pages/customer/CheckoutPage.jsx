import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Check, ArrowLeft, CreditCard,
  QrCode, X, ShieldCheck, Lock, ChevronRight,
  Wallet, ScanLine, AlertCircle, CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

/* ═══════════ Card Formatting Helpers ═══════════ */
const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const nums = v.replace(/\D/g, '').slice(0, 4);
  if (nums.length >= 3) return nums.slice(0, 2) + '/' + nums.slice(2);
  return nums;
};
const getCardBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return { name: 'Visa', color: 'text-blue-700', bg: 'bg-blue-50' };
  if (/^5[1-5]/.test(n)) return { name: 'Mastercard', color: 'text-orange-700', bg: 'bg-orange-50' };
  if (/^3[47]/.test(n)) return { name: 'Amex', color: 'text-indigo-700', bg: 'bg-indigo-50' };
  if (/^6/.test(n)) return { name: 'RuPay', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  return null;
};

/* ═══════════ UPI App Logos (SVG) ═══════════ */
const GPayLogo = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <path d="M43.6 20.1H42V20H24v8h11.3C33.9 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 5.7 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.6-.4-3.9z" fill="#FFC107"/>
    <path d="M6.3 14.7l6.6 4.8C14.5 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 5.7 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
    <path d="M24 44c5.2 0 9.9-1.8 13.4-5l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.5 39.6 16.2 44 24 44z" fill="#4CAF50"/>
    <path d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.7 39.5 44 34 44 24c0-1.3-.2-2.6-.4-3.9z" fill="#1976D2"/>
  </svg>
);

const PhonePeLogo = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <rect width="48" height="48" rx="10" fill="#5F259F"/>
    <path d="M16 34V14h8c4.4 0 8 3.6 8 8s-3.6 8-8 8h-4v4h-4zm4-8h4c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4v8z" fill="white"/>
    <circle cx="34" cy="14" r="2.5" fill="#80CBC4"/>
  </svg>
);

const PaytmLogo = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <rect width="48" height="48" rx="10" fill="#002E6E"/>
    <text x="24" y="28" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial, sans-serif">Paytm</text>
    <rect x="8" y="32" width="32" height="3" rx="1.5" fill="#00BAF2"/>
  </svg>
);

const BhimLogo = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <rect width="48" height="48" rx="10" fill="#E8F5E9"/>
    <path d="M24 8l-14 8v2c0 10 6 19.4 14 22 8-2.6 14-12 14-22v-2l-14-8z" fill="#2E7D32"/>
    <path d="M24 11l-11 6.3v1.6c0 8 4.8 15.5 11 17.6 6.2-2.1 11-9.6 11-17.6v-1.6L24 11z" fill="white"/>
    <text x="24" y="30" textAnchor="middle" fill="#2E7D32" fontSize="10" fontWeight="900" fontFamily="Arial, sans-serif">₹</text>
  </svg>
);

const UPI_LOGO_MAP = { gpay: GPayLogo, phonepe: PhonePeLogo, paytm: PaytmLogo, bhim: BhimLogo };

/* ═══════════ Payment Method SVG Icons ═══════════ */
const CashSVG = ({ active }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <rect x="4" y="12" width="40" height="24" rx="4" fill={active ? '#22c55e' : '#86efac'} />
    <rect x="7" y="15" width="34" height="18" rx="2" fill={active ? '#16a34a' : '#4ade80'} />
    <circle cx="24" cy="24" r="7" fill={active ? '#15803d' : '#22c55e'} stroke="white" strokeWidth="1.5" />
    <text x="24" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">₹</text>
    <rect x="10" y="18" width="5" height="3" rx="1" fill="white" opacity=".4" />
    <rect x="33" y="27" width="5" height="3" rx="1" fill="white" opacity=".4" />
  </svg>
);

const UpiSVG = ({ active }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <rect x="12" y="4" width="24" height="40" rx="5" fill={active ? '#7c3aed' : '#c4b5fd'} />
    <rect x="15" y="8" width="18" height="28" rx="2" fill="white" />
    <rect x="20" y="38" width="8" height="2" rx="1" fill={active ? '#a78bfa' : '#e9d5ff'} />
    <path d="M20 17l4 8 4-8" stroke={active ? '#7c3aed' : '#8b5cf6'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x="24" y="32" textAnchor="middle" fill={active ? '#7c3aed' : '#8b5cf6'} fontSize="5" fontWeight="900" fontFamily="Arial">UPI</text>
  </svg>
);

const CardSVG = ({ active }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <rect x="4" y="10" width="40" height="28" rx="5" fill={active ? '#1e40af' : '#93c5fd'} />
    <rect x="4" y="18" width="40" height="6" fill={active ? '#1e3a8a' : '#60a5fa'} />
    <rect x="8" y="12" width="8" height="5" rx="1.5" fill="#fbbf24" />
    <rect x="9" y="13" width="2" height="3" rx="0.5" fill="#f59e0b" />
    <rect x="12" y="13" width="2" height="3" rx="0.5" fill="#f59e0b" />
    <rect x="8" y="28" width="14" height="3" rx="1.5" fill="white" opacity=".5" />
    <rect x="8" y="33" width="8" height="2" rx="1" fill="white" opacity=".3" />
    <text x="40" y="35" textAnchor="end" fill="white" fontSize="6" fontWeight="700" fontFamily="Arial" opacity=".6">VISA</text>
  </svg>
);

const BankSVG = ({ active }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full">
    <path d="M24 6L4 18h40L24 6z" fill={active ? '#0369a1' : '#7dd3fc'} />
    <rect x="8" y="18" width="4" height="16" fill={active ? '#0284c7' : '#38bdf8'} />
    <rect x="16" y="18" width="4" height="16" fill={active ? '#0284c7' : '#38bdf8'} />
    <rect x="24" y="18" width="4" height="16" fill={active ? '#0284c7' : '#38bdf8'} />
    <rect x="32" y="18" width="4" height="16" fill={active ? '#0284c7' : '#38bdf8'} />
    <rect x="36" y="18" width="4" height="16" fill={active ? '#0284c7' : '#38bdf8'} />
    <rect x="4" y="34" width="40" height="4" rx="1" fill={active ? '#075985' : '#0ea5e9'} />
    <rect x="6" y="38" width="36" height="4" rx="1" fill={active ? '#0c4a6e' : '#0284c7'} />
    <circle cx="24" cy="13" r="3" fill="white" opacity=".5" />
  </svg>
);

const PAYMENT_ICON_MAP = { cod: CashSVG, upi: UpiSVG, card: CardSVG, netbanking: BankSVG };

/* ═══════════ UPI Apps ═══════════ */
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay' },
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'bhim', name: 'BHIM UPI' },
];

/* ═══════════ Banks ═══════════ */
const BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra', short: 'KOTAK' },
  { id: 'bob', name: 'Bank of Baroda', short: 'BOB' },
  { id: 'pnb', name: 'Punjab National Bank', short: 'PNB' },
  { id: 'canara', name: 'Canara Bank', short: 'CANARA' },
];

/* ═══════════ QR Modal ═══════════ */
function QRModal({ open, onClose, total }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-0 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-6 pt-6 pb-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <ScanLine className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-lg">Scan & Pay</h3>
          <p className="text-primary-100 text-sm mt-1">Use any UPI app to scan</p>
        </div>

        {/* QR Area */}
        <div className="px-6 -mt-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            {/* Fake QR Code — generated via CSS grid pattern */}
            <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-xl p-3 relative">
              <div className="w-full h-full relative">
                {/* QR corner markers */}
                {[
                  'top-0 left-0', 'top-0 right-0', 'bottom-0 left-0'
                ].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8 border-[3px] border-gray-800 ${i === 0 ? 'rounded-tl-md border-r-0 border-b-0' : i === 1 ? 'rounded-tr-md border-l-0 border-b-0' : 'rounded-bl-md border-r-0 border-t-0'}`}>
                    <div className={`absolute ${i === 0 ? 'top-1 left-1' : i === 1 ? 'top-1 right-1' : 'bottom-1 left-1'} w-4 h-4 bg-gray-50 rounded-sm`} />
                  </div>
                ))}
                {/* QR pattern grid */}
                <div className="absolute inset-8 grid grid-cols-8 grid-rows-8 gap-[2px]">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div key={i} className={`rounded-[1px] ${Math.random() > 0.45 ? 'bg-gray-50' : 'bg-transparent'}`} />
                  ))}
                </div>
                {/* Center logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white text-lg">₹</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-2xl font-black text-primary-800 mt-4">₹{total}</p>
            <p className="text-xs text-gray-500 mt-1">agrimarket@upi</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Secured by UPI · NPCI
          </div>
          <div className="flex justify-center gap-3 mt-3">
            {UPI_APPS.map(app => {
              const Logo = UPI_LOGO_MAP[app.id];
              return (
                <div key={app.id} className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                  {Logo && <Logo />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Main CheckoutPage ═══════════ */
export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [addr, setAddr] = useState({ name:'', phone:'', street:'', city:'', state:'', pincode:'' });

  // Payment state
  const [method, setMethod] = useState('cod');       // cod | upi | card | netbanking
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [cardForm, setCardForm] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [cardErrors, setCardErrors] = useState({});
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((s,i) => s + i.price*i.quantity, 0);
  const delivery = subtotal >= 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  if (items.length === 0) return (
    <div className="page-container py-16 text-center">
      <p className="text-gray-500 mb-4">Your cart is empty.</p>
      <Link to="/" className="btn-primary btn-sm">Shop Now</Link>
    </div>
  );

  /* ─── Card Validation ─── */
  const validateCard = () => {
    const errs = {};
    const num = cardForm.number.replace(/\s/g, '');
    if (num.length < 13 || num.length > 16) errs.number = 'Enter a valid card number';
    if (!cardForm.name.trim()) errs.name = 'Cardholder name required';
    const [mm, yy] = (cardForm.expiry || '').split('/');
    if (!mm || !yy || +mm < 1 || +mm > 12) errs.expiry = 'Invalid expiry';
    if (cardForm.cvv.length < 3) errs.cvv = 'Invalid CVV';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ─── Submit ─── */
  const handleOrder = async (e) => {
    e.preventDefault();
    if (method === 'card' && !validateCard()) return;
    if (method === 'upi' && !upiId && !selectedUpiApp) {
      toast.error('Enter UPI ID or select an app');
      return;
    }
    if (method === 'netbanking' && !selectedBank) {
      toast.error('Select a bank');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: addr,
        paymentMethod: method === 'cod' ? 'cod' : 'online',
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/my/orders/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const cardBrand = getCardBrand(cardForm.number);

  /* ═════════ Payment Methods Config ═════════ */
  const PAYMENT_METHODS = [
    { id: 'cod',        label: 'Cash on Delivery',    desc: 'Pay when your order arrives' },
    { id: 'upi',        label: 'UPI',                 desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card',       label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking',         desc: 'All major banks supported' },
  ];

  return (
    <div className="page-container py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-bold text-primary-800">Checkout</h1>
      </div>

      <form onSubmit={handleOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Left Column ═══ */}
          <div className="lg:col-span-2 space-y-5">
            {/* ── Delivery Address ── */}
            <div className="card card-body">
              <h3 className="font-bold text-primary-800 mb-4">Delivery Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['name','Full Name'],['phone','Phone Number'],['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([k,label]) => (
                  <div key={k} className={`form-group ${k==='street'?'sm:col-span-2':''}`}>
                    <label className="label">{label} *</label>
                    <input required className="input" value={addr[k]} onChange={e => setAddr(a=>({...a,[k]:e.target.value}))} placeholder={label} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Payment Method ── */}
            <div className="card card-body">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-primary-800">Payment Method</h3>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> 100% Secure
                </div>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, desc }) => {
                  const PayIcon = PAYMENT_ICON_MAP[id];
                  return (
                  <div key={id}>
                    {/* Radio Option */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
                        ${method === id
                          ? 'border-primary-500 bg-primary-50/70 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                        }`}
                    >
                      <input type="radio" name="payMethod" value={id} checked={method === id} onChange={() => setMethod(id)} className="sr-only" />
                      
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl overflow-hidden transition-all duration-300
                        ${method === id ? 'scale-105 shadow-md' : ''}`}>
                        {PayIcon && <PayIcon active={method === id} />}
                      </div>

                      {/* Label */}
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${method === id ? 'text-primary-800' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>

                      {/* Check */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${method === id ? 'border-primary-600 bg-white scale-110' : 'border-gray-200'}`}>
                        {method === id && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </label>

                    {/* ═══ Dynamic Sub-Sections ═══ */}

                    {/* UPI Section */}
                    {id === 'upi' && method === 'upi' && (
                      <div className="mt-2 ml-4 mr-0 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-fade-in">
                        {/* UPI Apps */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pay with UPI App</p>
                          <div className="grid grid-cols-4 gap-2">
                            {UPI_APPS.map(app => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setSelectedUpiApp(app.id)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                                  ${selectedUpiApp === app.id
                                    ? 'border-primary-300 bg-primary-50 shadow-sm'
                                    : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                                  }`}
                              >
                                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                                  {(() => { const Logo = UPI_LOGO_MAP[app.id]; return Logo ? <Logo /> : null; })()}
                                </div>
                                <span className="text-[10px] font-semibold text-gray-600">{app.name}</span>
                                {selectedUpiApp === app.id && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 -mt-0.5" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* UPI ID Input */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter UPI ID</p>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="name@upi"
                                className="input pl-10 text-sm"
                              />
                            </div>
                            {upiId && upiId.includes('@') && (
                              <div className="flex items-center px-3 bg-green-50 border border-green-200 rounded-xl">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* QR Scan Button */}
                        <button
                          type="button"
                          onClick={() => setShowQR(true)}
                          className="w-full flex items-center justify-center gap-3 p-4 bg-white rounded-xl border border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50/50 transition-all group"
                        >
                          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <QrCode className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-700">Scan QR Code</p>
                            <p className="text-[10px] text-gray-500">Open any UPI app and scan</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}

                    {/* Card Section */}
                    {id === 'card' && method === 'card' && (
                      <div className="mt-2 ml-4 mr-0 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-fade-in">
                        {/* Visual Card Preview */}
                        <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg overflow-hidden">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-1">
                              <div className="w-7 h-5 bg-yellow-400 rounded-sm" />
                              <div className="w-4 h-5 bg-yellow-300/50 rounded-sm" />
                            </div>
                            {cardBrand ? (
                              <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${cardBrand.bg} ${cardBrand.color}`}>
                                {cardBrand.name}
                              </span>
                            ) : (
                              <CreditCard className="w-6 h-6 opacity-40" />
                            )}
                          </div>
                          <p className="font-mono text-lg tracking-[3px] mb-4">
                            {cardForm.number || '•••• •••• •••• ••••'}
                          </p>
                          <div className="flex justify-between text-xs">
                            <div>
                              <p className="text-white/50 text-[9px] uppercase">Card Holder</p>
                              <p className="font-semibold tracking-wide">{cardForm.name || 'YOUR NAME'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/50 text-[9px] uppercase">Expires</p>
                              <p className="font-semibold">{cardForm.expiry || 'MM/YY'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Card Form */}
                        <div className="space-y-3">
                          {/* Card Number */}
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Card Number</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                inputMode="numeric"
                                value={cardForm.number}
                                onChange={(e) => setCardForm(f => ({ ...f, number: formatCardNumber(e.target.value) }))}
                                placeholder="1234 5678 9012 3456"
                                className={`input pl-10 pr-16 font-mono text-sm ${cardErrors.number ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
                              />
                              {cardBrand && (
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${cardBrand.bg} ${cardBrand.color}`}>
                                  {cardBrand.name}
                                </span>
                              )}
                            </div>
                            {cardErrors.number && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{cardErrors.number}</p>}
                          </div>

                          {/* Cardholder Name */}
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardForm.name}
                              onChange={(e) => setCardForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                              placeholder="JOHN DOE"
                              className={`input text-sm uppercase tracking-wide ${cardErrors.name ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
                            />
                            {cardErrors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{cardErrors.name}</p>}
                          </div>

                          {/* Expiry + CVV */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Expiry</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={cardForm.expiry}
                                onChange={(e) => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                                placeholder="MM/YY"
                                className={`input text-sm font-mono text-center ${cardErrors.expiry ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
                              />
                              {cardErrors.expiry && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{cardErrors.expiry}</p>}
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">CVV</label>
                              <div className="relative">
                                <input
                                  type="password"
                                  inputMode="numeric"
                                  maxLength={4}
                                  value={cardForm.cvv}
                                  onChange={(e) => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '') }))}
                                  placeholder="•••"
                                  className={`input text-sm font-mono text-center ${cardErrors.cvv ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                              </div>
                              {cardErrors.cvv && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{cardErrors.cvv}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium pt-1">
                          <Lock className="w-3 h-3" /> Your card details are encrypted & secure
                        </div>
                      </div>
                    )}

                    {/* Net Banking Section */}
                    {id === 'netbanking' && method === 'netbanking' && (
                      <div className="mt-2 ml-4 mr-0 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-fade-in">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Your Bank</p>

                        {/* Popular Banks Grid */}
                        <div className="grid grid-cols-4 gap-2">
                          {BANKS.slice(0, 8).map(bank => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => setSelectedBank(bank.id)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                                ${selectedBank === bank.id
                                  ? 'border-primary-300 bg-primary-50 shadow-sm'
                                  : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                                }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all
                                ${selectedBank === bank.id ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                                {bank.short.slice(0, 3)}
                              </div>
                              <span className="text-[9px] font-semibold text-gray-600 leading-tight text-center">{bank.name.split(' ').slice(0, 2).join(' ')}</span>
                              {selectedBank === bank.id && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 -mt-0.5" />
                              )}
                            </button>
                          ))}
                        </div>

                        {selectedBank && (
                          <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-100 rounded-xl animate-fade-in">
                            <CheckCircle2 className="w-4 h-4 text-primary-600" />
                            <p className="text-xs font-semibold text-primary-700">
                              You'll be redirected to {BANKS.find(b => b.id === selectedBank)?.name} to complete payment
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══ Right Column — Order Summary ═══ */}
          <div>
            <div className="card card-body sticky top-20">
              <h3 className="font-bold text-primary-800 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {items.map(i => (
                  <div key={i.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[170px]">{i.name} ×{i.quantity}</span>
                    <span className="font-medium">₹{(i.price*i.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={delivery===0?'text-green-600 font-medium':''}>{delivery===0?'FREE':`₹${delivery}`}</span></div>
                <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{tax}</span></div>
                <div className="flex justify-between font-bold text-primary-800 text-base pt-2 border-t border-gray-100 mt-1"><span>Total</span><span className="text-primary-700">₹{total}</span></div>
              </div>

              {/* Dynamic button text */}
              <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-5">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
                ) : method === 'cod' ? (
                  `Place Order · ₹${total}`
                ) : method === 'upi' ? (
                  `Pay ₹${total} via UPI`
                ) : method === 'card' ? (
                  `Pay ₹${total} with Card`
                ) : (
                  `Pay ₹${total} via Net Banking`
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 font-medium mt-3">
                <Lock className="w-3 h-3" /> 256-bit SSL Encrypted
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* QR Scanner Modal */}
      <QRModal open={showQR} onClose={() => setShowQR(false)} total={total} />
    </div>
  );
}

export default CheckoutPage;
