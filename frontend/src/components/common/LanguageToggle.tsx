import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'pill' | 'dropdown' | 'compact' | 'light';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'pill', className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-inner backdrop-blur-sm ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            language === 'en'
              ? 'bg-gradient-to-r from-crop-600 to-crop-500 text-white shadow-sm shadow-crop-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          aria-pressed={language === 'en'}
          title="Switch to English"
        >
          <span>English</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            language === 'ta'
              ? 'bg-gradient-to-r from-crop-600 to-crop-500 text-white shadow-sm shadow-crop-500/30 font-medium'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          aria-pressed={language === 'ta'}
          title="தமிழுக்கு மாற்றவும்"
        >
          <span>தமிழ்</span>
        </button>
      </div>
    );
  }

  if (variant === 'light') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            language === 'en'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={language === 'en'}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('ta')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            language === 'ta'
              ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={language === 'ta'}
        >
          தமிழ்
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition-colors ${className}`}
        title={language === 'en' ? 'தமிழுக்கு மாற்றவும்' : 'Switch to English'}
        aria-label="Toggle Language"
      >
        <Globe className="w-3.5 h-3.5 text-crop-400" />
        <span className="font-bold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-all"
        aria-expanded={dropdownOpen}
        aria-label="Language selection dropdown"
      >
        <Globe className="w-3.5 h-3.5 text-crop-400" />
        <span className="font-semibold">{language === 'en' ? 'English' : 'தமிழ்'}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-1 w-32 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setDropdownOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
              language === 'en' ? 'text-crop-400 font-bold bg-slate-800/60' : 'text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <span>English</span>
            {language === 'en' && <Check className="w-3.5 h-3.5 text-crop-400" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage('ta');
              setDropdownOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
              language === 'ta' ? 'text-crop-400 font-bold bg-slate-800/60' : 'text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <span>தமிழ்</span>
            {language === 'ta' && <Check className="w-3.5 h-3.5 text-crop-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
