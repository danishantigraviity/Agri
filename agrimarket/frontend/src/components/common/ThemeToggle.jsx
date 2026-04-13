import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative w-14 h-7 bg-gray-200 bg-white dark:bg-gray-900/40 rounded-full p-1 transition-all duration-500 hover:ring-4 ring-primary-500/10 group"
      aria-label="Toggle Theme"
    >
      <div className={`
        absolute top-1 left-1 w-5 h-5 rounded-full shadow-lg transform transition-transform duration-500 flex items-center justify-center
        ${isDark ? 'translate-x-7 bg-primary-500' : 'translate-x-0 bg-white'}
      `}>
        {isDark ? (
          <Moon className="w-3 h-3 text-white fill-white animate-in zoom-in duration-300" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500 fill-amber-500 animate-in zoom-in duration-300" />
        )}
      </div>
      
      {/* Visual Indicator Dots */}
      <div className="flex justify-between px-2 w-full">
        <Sun className={`w-3 h-3 transition-opacity ${isDark ? 'opacity-20' : 'opacity-100'} text-amber-500`} />
        <Moon className={`w-3 h-3 transition-opacity ${isDark ? 'opacity-100' : 'opacity-20'} text-primary-400`} />
      </div>
    </button>
  );
}
