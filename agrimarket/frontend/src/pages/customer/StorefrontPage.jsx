import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ChevronDown, X,
  Leaf, Star, Award, Truck, Shield, ArrowRight, ArrowUpDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import Dropdown from '../../components/common/Dropdown';
import QuickViewModal from '../../components/customer/QuickViewModal';
/* ═══════════ Premium 3D Category SVGs ═══════════ */

const AllIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <linearGradient id="all-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#16A34A" />
      </linearGradient>
      <linearGradient id="all-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="all-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="all-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.2"/>
      </filter>
    </defs>
    <rect x="4" y="4" width="10" height="10" rx="3" fill="url(#all-grad)" filter="url(#shadow)" />
    <rect x="18" y="4" width="10" height="10" rx="3" fill="url(#all-grad-2)" filter="url(#shadow)" />
    <rect x="4" y="18" width="10" height="10" rx="3" fill="url(#all-grad-3)" filter="url(#shadow)" />
    <rect x="18" y="18" width="10" height="10" rx="3" fill="url(#all-grad-4)" filter="url(#shadow)" />
  </svg>
);

const VegIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <radialGradient id="veg-stalk" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#A3E635" />
        <stop offset="100%" stopColor="#4D7C0F" />
      </radialGradient>
      <radialGradient id="veg-floret" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="70%" stopColor="#15803D" />
        <stop offset="100%" stopColor="#14532D" />
      </radialGradient>
    </defs>
    {/* Stalk */}
    <path d="M12 20h8v7a3 3 0 0 1-6 0v-2h-2v-5z" fill="url(#veg-stalk)" />
    {/* Florets */}
    <circle cx="10" cy="14" r="6" fill="url(#veg-floret)" />
    <circle cx="22" cy="14" r="6" fill="url(#veg-floret)" />
    <circle cx="16" cy="10" r="7" fill="url(#veg-floret)" />
    <circle cx="13" cy="18" r="4.5" fill="url(#veg-floret)" />
    <circle cx="19" cy="18" r="4.5" fill="url(#veg-floret)" />
  </svg>
);

const FruitIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <radialGradient id="apple-body" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="40%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </radialGradient>
      <linearGradient id="apple-leaf" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#86EFAC" />
      </linearGradient>
    </defs>
    <path d="M16 6c-3.5 0-6.5 2.5-8 6-1.2 2.8-.8 8.5 2 12.5 2.5 3.5 5 3.5 6 3.5s3.5 0 6-3.5c2.8-4 3.2-9.7 2-12.5-1.5-3.5-4.5-6-8-6z" fill="url(#apple-body)" />
    <path d="M16 8C16 8 15 4 18 2c0 0 3 .5 3 3.5S16 8 16 8z" fill="url(#apple-leaf)" />
    <path d="M16 8v3" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="11" cy="12" rx="2" ry="4" fill="#FEF2F2" opacity="0.4" transform="rotate(-30 11 12)" />
  </svg>
);

const DairyIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <linearGradient id="milk-glass" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
        <stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="80%" stopColor="#BAE6FD" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="milk-liquid" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>
    {/* Glass back rim */}
    <ellipse cx="16" cy="6" rx="8" ry="2" fill="#E0F2FE" />
    {/* Liquid inside */}
    <path d="M9.5 13l1.8 14.5c.3 1.5 1.8 2.5 3.5 2.5h2.4c1.7 0 3.2-1 3.5-2.5L22.5 13H9.5z" fill="url(#milk-liquid)" />
    {/* Liquid surface */}
    <ellipse cx="16" cy="13" rx="6.5" ry="1.5" fill="#FFFFFF" />
    {/* Glass body */}
    <path d="M8 6l2.8 21.5C11 29 13 31 16 31s5-2 5.2-3.5L24 6" fill="none" stroke="url(#milk-glass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Glass Front Rim */}
    <path d="M8 6c0 1.5 3.5 3 8 3s8-1.5 8-3" fill="none" stroke="url(#milk-glass)" strokeWidth="2" />
    {/* Highlight */}
    <path d="M11.5 14l1 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const GrainIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <linearGradient id="wheat" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
    </defs>
    {/* Stem */}
    <path d="M4 28s8-4 12-16" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    {/* Grains */}
    <path d="M15 15c-1.5-1.5-1.5-4 0-4 1.5 0 2 1.5 1.5 3L15 15z" fill="url(#wheat)" />
    <path d="M17 12c-1.5-1.5-1.5-4 0-4 1.5 0 2 1.5 1.5 3L17 12z" fill="url(#wheat)" />
    <path d="M19 9c-1.5-1.5-1.5-4 0-4 1.5 0 2 1.5 1.5 3L19 9z" fill="url(#wheat)" />
    <path d="M13 18c-1.5-1.5-1.5-4 0-4 1.5 0 2 1.5 1.5 3L13 18z" fill="url(#wheat)" />
    
    <path d="M16 16c1.5-1.5 4-1.5 4 0 0 1.5-1.5 2-3 1.5L16 16z" fill="url(#wheat)" />
    <path d="M18 13c1.5-1.5 4-1.5 4 0 0 1.5-1.5 2-3 1.5L18 13z" fill="url(#wheat)" />
    <path d="M20 10c1.5-1.5 4-1.5 4 0 0 1.5-1.5 2-3 1.5L20 10z" fill="url(#wheat)" />
    <path d="M14 19c1.5-1.5 4-1.5 4 0 0 1.5-1.5 2-3 1.5L14 19z" fill="url(#wheat)" />
    <path d="M23 5c-3 0-5 2-5 5h1c.5-2.5 2.5-4 4-4z" fill="#FDE68A" />
  </svg>
);

const PulseIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <radialGradient id="bean" cx="40%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="40%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#450A0A" />
      </radialGradient>
      <linearGradient id="bean-hilite" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g transform="translate(6, 12) rotate(-20)">
      <path d="M4 10c-3-3-2-8 3-9 6-1 10 3 10 8 0 4-4 7-8 7-3 0-4-3-5-6z" fill="url(#bean)" />
      {/* Eye/Hilbert */}
      <path d="M8 8c1 1 3 1 4 0" fill="none" stroke="#FEF2F2" strokeWidth="1" strokeLinecap="round" />
      <path d="M6 3c2-1 5 0 7 2" fill="none" stroke="url(#bean-hilite)" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    <g transform="translate(18, 16) rotate(40) scale(0.8)">
      <path d="M4 10c-3-3-2-8 3-9 6-1 10 3 10 8 0 4-4 7-8 7-3 0-4-3-5-6z" fill="url(#bean)" />
      <path d="M8 8c1 1 3 1 4 0" fill="none" stroke="#FEF2F2" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
);

const SpiceIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <linearGradient id="chili-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="30%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="chili-stem" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#14532D" />
      </linearGradient>
    </defs>
    <path d="M22 6c-2 2-6 8-8 11.5-2 3.5-5 7-9 9 1-1.5 5-5.5 8-8s8-9.5 12-11.5c1-1-1-3-3-1z" fill="url(#chili-body)" />
    <path d="M22 6c2.5-3 5-4 5-4" fill="none" stroke="url(#chili-stem)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="21" cy="6" r="2.5" fill="url(#chili-stem)" />
    {/* Highlight */}
    <path d="M21 7c-2 2-5.5 7-7 10" fill="none" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const HoneyIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <radialGradient id="honey-pot" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </radialGradient>
      <linearGradient id="honey-lid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Pot Body */}
    <path d="M9 13C6 17 6 23 8 26c2 3 5 4 8 4s6-1 8-4c2-3 2-9-1-13H9z" fill="url(#honey-pot)" />
    {/* Honey lines */}
    <path d="M11 20h10M13 24h6" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    {/* Highlight */}
    <path d="M10 18c-1 3-1 6 .5 8" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    {/* Lid */}
    <path d="M8 12c-1.5 0-2-1-2-2v-1c0-1.5 2-2 4-2h12c2 0 4 .5 4 2v1c0 1-.5 2-2 2H8z" fill="url(#honey-lid)" />
    <path d="M13 7V5c0-1 1-1.5 3-1.5h0c2 0 3 .5 3 1.5v2" fill="none" stroke="url(#honey-lid)" strokeWidth="3" />
  </svg>
);

const MedIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <linearGradient id="med-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
      <linearGradient id="med-cap" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>
    <path d="M22 10l-12 12c-2 2-5 2-7 0s-2-5 0-7l12-12c2-2 5-2 7 0s2 5 0 7z" fill="url(#med-grad)" />
    <path d="M22 10c2-2 5-2 7 0s2 5 0 7l-6 6-7-7 6-6z" fill="url(#med-cap)" />
    <path d="M15 15l2 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const EggIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5 drop-shadow-sm">
    <defs>
      <radialGradient id="egg" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FFEDD5" />
        <stop offset="60%" stopColor="#FDBA74" />
        <stop offset="100%" stopColor="#C2410C" />
      </radialGradient>
    </defs>
    <path d="M16 2c-5 0-9 8-10 16-1 7 4 12 10 12s11-5 10-12C25 10 21 2 16 2z" fill="url(#egg)" />
    <ellipse cx="14" cy="12" rx="4" ry="7" fill="#FFFFFF" opacity="0.4" transform="rotate(-25 14 12)" />
  </svg>
);

const CATEGORIES = [
  { key: 'all',        label: 'All',        icon: AllIcon },
  { key: 'vegetables', label: 'Vegetables', icon: VegIcon },
  { key: 'fruits',     label: 'Fruits',     icon: FruitIcon },
  { key: 'dairy',      label: 'Dairy',      icon: DairyIcon },
  { key: 'grains',     label: 'Grains',     icon: GrainIcon },
  { key: 'pulses',     label: 'Pulses',     icon: PulseIcon },
  { key: 'spices',     label: 'Spices',     icon: SpiceIcon },
  { key: 'honey',      label: 'Honey',      icon: HoneyIcon },
  { key: 'eggs',       label: 'Eggs',       icon: EggIcon },
  { key: 'medicine',   label: 'Medicines',  icon: MedIcon },
];

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'popular',   label: 'Most Popular' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
];

const HERO_FEATURES = [
  { icon: Leaf,   title: 'Farm Fresh',      desc: 'Direct from verified farmers' },
  { icon: Truck,  title: 'Fast Delivery',   desc: 'Same day & next day options' },
  { icon: Shield, title: '100% Organic',    desc: 'Certified produce available' },
  { icon: Award,  title: 'Quality Assured', desc: 'Admin-vetted farmers only' },
];

/* ═══════════ Filter Dropdown with Dynamic Price Slider ═══════════ */
const PRICE_MAX = 2000;
const PRICE_PRESETS = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 – ₹500', min: 100, max: 500 },
  { label: '₹500 – ₹1000', min: 500, max: 1000 },
  { label: '₹1000+', min: 1000, max: PRICE_MAX },
];

function FilterDropdown({ priceRange, setPriceRange, isOrganic, setIsOrganic, onApply, onClear, hasFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState(Number(priceRange.min) || 0);
  const [localMax, setLocalMax] = useState(Number(priceRange.max) || PRICE_MAX);
  const ref = useRef(null);
  const debounceRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync local state when external priceRange changes
  useEffect(() => {
    setLocalMin(Number(priceRange.min) || 0);
    setLocalMax(Number(priceRange.max) || PRICE_MAX);
  }, [priceRange]);

  // ── Live debounced update: push to parent after 300ms of no dragging ──
  const pushToParent = (min, max) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPriceRange({
        min: min > 0 ? String(min) : '',
        max: max < PRICE_MAX ? String(max) : '',
      });
      onApply();
    }, 300);
  };

  const handleMinChange = (val) => {
    const v = Math.min(Number(val), localMax - 10);
    const clamped = Math.max(0, v);
    setLocalMin(clamped);
    pushToParent(clamped, localMax);
  };

  const handleMaxChange = (val) => {
    const v = Math.max(Number(val), localMin + 10);
    const clamped = Math.min(PRICE_MAX, v);
    setLocalMax(clamped);
    pushToParent(localMin, clamped);
  };

  const resetFilters = () => {
    setLocalMin(0);
    setLocalMax(PRICE_MAX);
    setPriceRange({ min: '', max: '' });
    setIsOrganic(false);
    onClear();
  };

  const applyPreset = (preset) => {
    setLocalMin(preset.min);
    setLocalMax(preset.max);
    // Apply immediately for presets
    setPriceRange({
      min: preset.min > 0 ? String(preset.min) : '',
      max: preset.max < PRICE_MAX ? String(preset.max) : '',
    });
    onApply();
  };

  const activeFilterCount = (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) + (isOrganic ? 1 : 0);
  const minPercent = (localMin / PRICE_MAX) * 100;
  const maxPercent = (localMax / PRICE_MAX) * 100;

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95
          ${activeFilterCount > 0
            ? 'bg-primary-600 text-white border border-primary-600 hover:bg-gray-50'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 bg-white text-primary-700 text-[10px] font-black rounded-full flex items-center justify-center -mr-1">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute right-0 z-50 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden
          transition-all duration-300 origin-top-right
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="font-bold text-primary-800 text-sm">Filter Products</h3>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                Reset All
              </button>
            )}
            <span className="text-[9px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">LIVE</span>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5">
          {/* ── Price Range Slider ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price Range</label>
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                ₹{localMin} – {localMax >= PRICE_MAX ? '₹2000+' : `₹${localMax}`}
              </span>
            </div>

            {/* Dual Range Slider */}
            <div className="relative h-6 flex items-center">
              {/* Track BG */}
              <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
              {/* Active Track */}
              <div
                className="absolute h-1.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-100"
                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
              />
              {/* Min Thumb */}
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={10}
                value={localMin}
                onChange={(e) => handleMinChange(e.target.value)}
                className="range-thumb"
                style={{ zIndex: localMin > PRICE_MAX - 100 ? 5 : 3 }}
              />
              {/* Max Thumb */}
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={10}
                value={localMax}
                onChange={(e) => handleMaxChange(e.target.value)}
                className="range-thumb"
                style={{ zIndex: 4 }}
              />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between mt-1 px-0.5">
              {['₹0', '₹500', '₹1k', '₹1.5k', '₹2k+'].map((l) => (
                <span key={l} className="text-[9px] text-gray-400 font-medium">{l}</span>
              ))}
            </div>
          </div>

          {/* ── Quick Price Presets ── */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Quick Select</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRICE_PRESETS.map((preset) => {
                const isActive = localMin === preset.min && localMax === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all
                      ${isActive
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-primary-50 hover:text-primary-700'
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Organic Toggle ── */}
          <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2">
              <span className="text-sm">🌿</span>
              <span className="text-sm font-semibold text-gray-700">Organic Only</span>
            </div>
            <button
              onClick={() => { setIsOrganic(!isOrganic); onApply(); }}
              className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${isOrganic ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isOrganic ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ StorefrontPage ═══════════ */
export default function StorefrontPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [search, setSearch] = useState(params.get('search') || '');
  const [sort, setSort] = useState(params.get('sort') || 'newest');
  const [isOrganic, setIsOrganic] = useState(params.get('isOrganic') === 'true');
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Sync URL params
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('category') && p.get('category') !== 'all') setCategory(p.get('category'));
    if (p.get('search')) setSearch(p.get('search'));
    if (p.get('isOrganic') === 'true') setIsOrganic(true);
  }, [location.search]);

  // Handle Smart Search Suggestions
  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data: res } = await api.get('/products', { 
          params: { search, limit: 5 } 
        });
        setSuggestions(res.data.products);
      } catch (e) {
        console.error('Suggestion error', e);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleQuickView = (p) => {
    setSelectedProduct(p);
    setIsQuickViewOpen(true);
  };

  const queryParams = {
    ...(category && category !== 'all' && { category }),
    ...(search && { search }),
    ...(sort && { sort }),
    ...(isOrganic && { isOrganic: 'true' }),
    ...(priceRange.min && { minPrice: priceRange.min }),
    ...(priceRange.max && { maxPrice: priceRange.max }),
    page,
    limit: 12,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const endpoint = category === 'medicine' ? '/medicines' : '/products';
      const { data: res } = await api.get(endpoint, { params: queryParams });
      
      // Data normalization for medicines
      if (category === 'medicine') {
        return {
          products: res.data.medicines.map(m => ({
            ...m,
            images: [m.image],
            farmer: { name: m.brand, _id: m.brand },
            subcategory: m.type,
            price: { ...m.price, unit: 'pk' }
          })),
          pagination: { total: res.results, pages: 1 } // Medicine API currently doesn't provide full pagination
        };
      }
      
      return res.data;
    },
    keepPreviousData: true,
  });

  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products/featured').then(r => r.data.data),
  });

  const products = data?.products || [];
  const pagination = data?.pagination;

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const clearFilters = () => {
    setCategory('all');
    setSearch('');
    setSort('newest');
    setIsOrganic(false);
    setPriceRange({ min: '', max: '' });
    setPage(1);
  };

  const hasFilters = category !== 'all' || search || isOrganic || priceRange.min || priceRange.max;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-yellow-400/20 blur-3xl" />
        </div>
        <div className="page-container py-12 md:py-20 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
              <Leaf className="w-3.5 h-3.5" /> 500+ Verified Farmers
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Fresh From Farm,<br />
              <span className="text-primary-200">Right to Your Table</span>
            </h1>
            <p className="text-primary-100 text-base md:text-lg mb-8 max-w-xl">
              Shop directly from verified local farmers. Get the freshest produce at honest prices, delivered to your door.
            </p>
            {/* Hero Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); }}
              className="flex gap-2 max-w-xl"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" style={{width:'18px',height:'18px'}} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search fresh vegetables, fruits..."
                  className="input pl-10 bg-white/95 text-primary-800"
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
                    {suggestions.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          setSearch(p.name);
                          setShowSuggestions(false);
                          setPage(1);
                        }}
                        className="flex items-center gap-3 w-full p-3 hover:bg-primary-50 text-left transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary-800">{p.name}</p>
                          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">₹{p.price.selling} • {p.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn-primary bg-white text-primary-700 hover:bg-gray-50 font-semibold border-none">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {HERO_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-primary-600" style={{width:'18px',height:'18px'}} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-primary-800">{title}</p>
                  <p className="text-xs text-gray-500 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container py-8">
        {/* ── Featured Products ── */}
        {featuredData?.length > 0 && !search && category === 'all' && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-heading">Featured Picks</h2>
                <p className="section-subheading">Handpicked fresh produce</p>
              </div>
              <Link to="/?sort=popular" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {featuredData.slice(0, 5).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Categories ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0 transition-all
                  ${category === cat.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50'
                  }`}
              >
                <Icon />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Controls row ── */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-primary-800">
              {category === 'all' ? 'All Products' : CATEGORIES.find(c => c.key === category)?.label}
            </h2>
            {pagination && (
              <span className="text-sm text-gray-500">({pagination.total} items)</span>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Organic toggle */}
            <button
              onClick={() => { setIsOrganic(!isOrganic); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                ${isOrganic ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 text-gray-600 bg-white hover:border-green-400'}`}
            >
              🌿 Organic Only
            </button>

            {/* ── Filter Dropdown ── */}
            <FilterDropdown
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              isOrganic={isOrganic}
              setIsOrganic={setIsOrganic}
              category={category}
              setCategory={setCategory}
              categories={CATEGORIES}
              onApply={() => setPage(1)}
              onClear={clearFilters}
              hasFilters={hasFilters}
            />

            {/* Sort */}
            <Dropdown
              icon={ArrowUpDown}
              label={SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort'}
              align="right"
              options={SORT_OPTIONS.map(o => ({
                label: o.label,
                active: sort === o.value,
                onClick: () => { setSort(o.value); setPage(1); },
              }))}
            />
          </div>
        </div>


        {/* ── Product Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">No products found</p>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="btn-primary btn-sm">Clear All Filters</button>
          </div>
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${isFetching ? 'opacity-70 pointer-events-none' : ''}`}>
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onQuickView={() => handleQuickView(p)} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === pg ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={!pagination.hasNext}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <QuickViewModal 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
