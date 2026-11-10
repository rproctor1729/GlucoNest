'use client';

import { useEffect, useId, useState, type FocusEvent, type MouseEvent } from 'react';
import { PanelLeftClose, PanelLeftOpen, Plus, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useModalFocus } from '@/components/common/useModalFocus';
import { workspaceNavigation, type WorkspaceNavItem } from '@/data/workspaceNavigation';
import BrandMark from '@/components/brand/BrandMark';
import type { NavigationSection } from '@/types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  open: boolean;
  onClose: () => void;
  home: boolean;
}

const itemClasses = 'sidebar-item relative flex h-[var(--sidebar-item-height)] min-w-0 shrink-0 items-center gap-[var(--sidebar-space)] rounded-[var(--sidebar-radius)] px-[var(--sidebar-space)] text-left text-sm font-medium';

export default function Sidebar({ collapsed, onToggleCollapsed, open, onClose, home }: SidebarProps) {
  const { activeSection, setActiveSection, language, connectionStatus, localDataError } = useApp();
  const [hint, setHint] = useState<{ text: string; top: number } | null>(null);
  const tooltipId = useId();
  const drawerRef = useModalFocus(open, onClose);
  const { main, bottom } = workspaceNavigation(language);
  const attention = connectionStatus === 'error' || !!localDataError;
  const go = (section: NavigationSection) => { setHint(null); setActiveSection(section); onClose(); };

  useEffect(() => { setHint(null); }, [activeSection, collapsed, open]);

  const showHint = (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>, text: string) => {
    if (!collapsed || !window.matchMedia('(min-width: 901px)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setHint({ text, top: Math.max(8, Math.min(window.innerHeight - 48, rect.top + rect.height / 2 - 18)) });
  };
  const hintEvents = (text: string) => ({
    onMouseEnter: (event: MouseEvent<HTMLElement>) => showHint(event, text),
    onFocus: (event: FocusEvent<HTMLElement>) => showHint(event, text),
    onMouseLeave: () => setHint(null), onBlur: () => setHint(null),
  });
  const renderItem = ({ id, label, icon: Icon }: WorkspaceNavItem) => <a key={id} href={`#${id}`} className={itemClasses}
    aria-current={activeSection === id ? 'page' : undefined} aria-label={label} {...hintEvents(label)}
    onClick={event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); go(id);
    }}>
    <Icon size={18} strokeWidth={1.5} className="sidebar-nav-icon shrink-0" aria-hidden="true" />
    <span className="sidebar-label min-w-0 truncate">{label}</span>
    {id === 'devices' && attention && <span className="sidebar-attention ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded text-[11px]" aria-label="Needs attention">!</span>}
  </a>;

  return <div ref={drawerRef} id="workspace-navigation" role={open ? 'dialog' : undefined} aria-modal={open ? true : undefined}
    aria-label="Application navigation" tabIndex={-1} data-collapsed={collapsed} data-home={home} data-open={open} onScroll={() => setHint(null)} onKeyDown={event => { if (event.key === 'Escape') setHint(null); }}
    className="product-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r p-[var(--sidebar-space)] font-sans">
    <div className="sidebar-brand-row flex h-14 shrink-0 items-center px-2">
      <a href="#home" className="sidebar-brand flex min-h-9 min-w-0 items-center gap-2 rounded font-medium" aria-label="GlucoNest home" {...hintEvents('GlucoNest home')}
        onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); go('home'); } }}>
        <BrandMark className="h-7 w-7 shrink-0" /><span className="sidebar-label text-[20px] tracking-[-.04em]">GlucoNest</span>
      </a>
      <button type="button" className="sidebar-mobile-close ml-auto flex h-9 w-9 items-center justify-center rounded" onClick={onClose} aria-label="Close navigation"><X size={18} strokeWidth={1.5} /></button>
    </div>

    <button type="button" className={`${itemClasses} sidebar-primary my-4 shrink-0`} aria-label="Log" aria-current={activeSection === 'quick-log' ? 'page' : undefined}
      {...hintEvents('Log')} onClick={() => go('quick-log')}>
      <Plus size={18} strokeWidth={1.5} className="shrink-0" aria-hidden="true" /><span className="sidebar-label">Log</span>
    </button>

    <nav aria-label="Main navigation" className="sidebar-main flex min-h-0 flex-1 flex-col gap-[var(--sidebar-item-gap)] overflow-y-auto">{main.map(renderItem)}</nav>

    <div className="sidebar-bottom mt-6 shrink-0">
      <nav aria-label="More navigation" className="flex flex-col gap-[var(--sidebar-item-gap)]">{bottom.map(renderItem)}</nav>
      <div className="mt-4 flex justify-end">
        <button type="button" className="sidebar-collapse flex h-9 w-9 shrink-0 items-center justify-center rounded" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} aria-controls="workspace-navigation"
          {...hintEvents(collapsed ? 'Expand sidebar' : 'Collapse sidebar')} onClick={onToggleCollapsed}>
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.5} /> : <PanelLeftClose size={18} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
    {hint && <div id={tooltipId} role="tooltip" className="sidebar-tooltip pointer-events-none fixed left-[72px] z-[80] max-w-[240px] rounded border px-3 py-2 text-xs font-medium" style={{ top: hint.top }}>{hint.text}</div>}
  </div>;
}
