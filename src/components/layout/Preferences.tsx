'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { SlidersHorizontal, Check, Globe, Moon, Sun, Gauge } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { APP_LANGUAGES, type AppLanguage } from '@/lib/i18n';

export default function Preferences() {
  const { activeSection, language, setLanguage, darkMode, toggleDarkMode, glucoseUnit, toggleGlucoseUnit } = useApp();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => { setOpen(false); }, [activeSection]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return (
    <div
      ref={container}
      className="global-preferences"
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        type="button"
        ref={trigger}
        aria-label="Preferences"
        title="Preferences"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className={`icon-button preferences-trigger ${open ? 'preferences-trigger-active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <SlidersHorizontal size={18} />
      </button>

      {open && (
        <div id={id} role="dialog" aria-label="Quick Settings" className="preferences-panel animate-fadeIn">
          <div className="preferences-header">
            <span className="preferences-title">Quick Settings</span>
          </div>

          <div className="pref-group">
            <span className="pref-label">
              <Globe size={14} className="pref-icon" /> Language
            </span>
            <div className="pref-pill-group">
              {APP_LANGUAGES.map(item => (
                <button
                  key={item.code}
                  type="button"
                  className={`pref-pill ${language === item.code ? 'pref-pill-active' : ''}`}
                  onClick={() => setLanguage(item.code as AppLanguage)}
                >
                  {item.label}
                  {language === item.code && <Check size={12} className="inline ml-1" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pref-group">
            <span className="pref-label">
              {darkMode ? <Moon size={14} className="pref-icon" /> : <Sun size={14} className="pref-icon" />} Appearance
            </span>
            <div className="pref-pill-group">
              <button
                type="button"
                className={`pref-pill ${!darkMode ? 'pref-pill-active' : ''}`}
                onClick={() => { if (darkMode) toggleDarkMode(); }}
              >
                <Sun size={13} className="inline mr-1" /> Light
              </button>
              <button
                type="button"
                className={`pref-pill ${darkMode ? 'pref-pill-active' : ''}`}
                onClick={() => { if (!darkMode) toggleDarkMode(); }}
              >
                <Moon size={13} className="inline mr-1" /> Dark
              </button>
            </div>
          </div>

          <div className="pref-group">
            <span className="pref-label">
              <Gauge size={14} className="pref-icon" /> Glucose Unit
            </span>
            <div className="pref-pill-group">
              <button
                type="button"
                className={`pref-pill ${glucoseUnit === 'mg/dL' ? 'pref-pill-active' : ''}`}
                onClick={() => { if (glucoseUnit !== 'mg/dL') toggleGlucoseUnit(); }}
              >
                mg/dL
              </button>
              <button
                type="button"
                className={`pref-pill ${glucoseUnit === 'mmol/L' ? 'pref-pill-active' : ''}`}
                onClick={() => { if (glucoseUnit !== 'mmol/L') toggleGlucoseUnit(); }}
              >
                mmol/L
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
