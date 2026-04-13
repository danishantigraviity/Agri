import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Modern Dropdown Component
 * Props:
 * - trigger: React element to trigger the dropdown (optional)
 * - label: Text for the trigger button (if trigger not provided)
 * - icon: Icon element for the trigger button
 * - options: Array of { label, icon, onClick, active, divider }
 * - align: 'left' or 'right' (default 'right')
 */
export default function Dropdown({ 
  trigger, 
  label, 
  icon: Icon, 
  options = [], 
  align = 'right',
  children
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger ? trigger : (
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
            {label}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      <div 
        className={`absolute z-50 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-xl overflow-hidden
                    transition-all duration-300 origin-top
                    ${align === 'right' ? 'right-0' : 'left-0'}
                    ${isOpen ? 'opacity-100 scale-100 transform' : 'opacity-0 scale-95 pointer-events-none transform'}
                  `}
      >
        <div className="py-2" onClick={() => setIsOpen(false)}>
          {children ? children : (
            options.map((option, idx) => {
              if (option.divider) {
                return <div key={idx} className="h-px bg-gray-100 my-1 mx-2" />;
              }

              const ItemIcon = option.icon;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    option.onClick?.();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative group
                              ${option.active ? 'text-primary-700 font-bold' : 'text-gray-600 hover:text-primary-800'}
                              hover:bg-primary-50
                            `}
                >
                  {/* Active Indicator */}
                  {option.active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-md" />
                  )}

                  {/* Status Dot indicator */}
                  {option.color && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse-subtle
                      ${option.color === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                        option.color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                        option.color === 'blue' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' :
                        option.color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                        'bg-gray-400'}
                    `} />
                  )}

                  {ItemIcon && (
                    <ItemIcon className={`w-4.5 h-4.5 transition-colors ${option.active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  )}
                  
                  <span className="flex-1 text-left">{option.label}</span>

                  {option.active && <Check className="w-3.5 h-3.5 text-primary-600" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
