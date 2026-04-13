import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Modern FormSelect Component
 * A premium replacement for native <select> elements.
 * Props:
 * - label: Label text for the field (optional)
 * - value: Current selected value
 * - onChange: Callback when value changes
 * - options: Array of strings or { label, value } objects
 * - placeholder: Default text
 * - required: Boolean
 */
export default function FormSelect({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select option',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  return (
    <div className="form-group relative" ref={containerRef}>
      {label && <label className="label mb-1.5 block">{label}</label>}
      
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all duration-300
          ${isOpen 
            ? 'border-primary-500 ring-4 ring-primary-50 shadow-sm' 
            : 'border-gray-200 hover:border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.02)]'
          }
          ${!selectedOption ? 'text-gray-400' : 'text-primary-800'}
        `}
      >
        <span className="capitalize">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute z-[60] left-0 right-0 mt-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/50 
                    transition-all duration-300 origin-top
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                  `}
      >
        <div className="max-h-60 overflow-y-auto no-scrollbar py-1">
          {normalizedOptions.map((opt, idx) => {
            const isActive = opt.value === value;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative
                            ${isActive 
                              ? 'bg-primary-50 text-primary-700 font-bold' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-primary-800'}
                          `}
              >
                <span className="flex-1 text-left capitalize">{opt.label}</span>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-700" strokeWidth={3} />
                  </div>
                )}
                
                {/* Visual hover indicator */}
                {!isActive && (
                  <div className="absolute inset-x-1.5 inset-y-1 bg-gray-100/0 rounded-lg group-hover:bg-gray-100/50 transition-colors -z-10" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
