import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ActionDropdown({ 
  label = "Actions", 
  icon: Icon, 
  options = [], 
  align = 'right' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colorStyles = {
    green: 'text-green-700 hover:bg-green-50 hover:text-green-800',
    red: 'text-red-700 hover:bg-red-50 hover:text-red-800',
    blue: 'text-blue-700 hover:bg-blue-50 hover:text-blue-800',
    amber: 'text-amber-700 hover:bg-amber-50 hover:text-amber-800',
    gray: 'text-gray-700 hover:bg-gray-50 hover:text-primary-800',
  };

  const iconColorStyles = {
    green: 'text-green-500 group-hover:text-green-600',
    red: 'text-red-500 group-hover:text-red-600',
    blue: 'text-blue-500 group-hover:text-blue-600',
    amber: 'text-amber-500 group-hover:text-amber-600',
    gray: 'text-gray-400 group-hover:text-gray-600',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />}
        {label}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      <div 
        className={`absolute z-50 mt-1.5 w-40 rounded-xl bg-white border border-gray-100 shadow-xl overflow-hidden
                    transition-all duration-200 origin-top-right
                    ${align === 'right' ? 'right-0' : 'left-0'}
                    ${isOpen ? 'opacity-100 scale-100 transform' : 'opacity-0 scale-95 pointer-events-none transform'}
                  `}
      >
        <div className="p-1.5 flex flex-col gap-0.5">
          {options.map((option, idx) => {
            if (option.hidden) return null;
            if (option.divider) {
              return <div key={`div-${idx}`} className="h-px bg-gray-100 my-1 mx-2" />;
            }

            const ItemIcon = option.icon;
            const style = colorStyles[option.color || 'gray'];
            const iconStyle = iconColorStyles[option.color || 'gray'];

            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  option.onClick?.();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors group ${style}`}
              >
                {ItemIcon && <ItemIcon className={`w-4 h-4 ${iconStyle}`} strokeWidth={2} />}
                <span className="flex-1 text-left">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
