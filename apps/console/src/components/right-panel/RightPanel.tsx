import { useEffect, useRef } from 'react';
import { Book, Bot, ChevronsRight, X } from 'lucide-react';
import {
  RIGHT_PANEL_LIMITS,
  useRightPanel,
  type RightPanelTabId,
} from './RightPanelContext';
import { RightPanelSettings } from './RightPanelSettings';
import { DictionaryPanel } from './DictionaryPanel';

interface TabDef {
  id: RightPanelTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  render: () => React.ReactNode;
  disabled?: boolean;
}

/**
 * Persistent right-side panel mounted in `AppShell`. Tabs are declared in a single
 * registry; the AI tab is registered now as a placeholder (disabled) so the shape
 * is locked in for the next phase without restructuring.
 */
const TABS: TabDef[] = [
  { id: 'dictionary', label: 'พจนานุกรม', icon: Book, render: () => <DictionaryPanel /> },
  {
    id: 'ai',
    label: 'AI',
    icon: Bot,
    disabled: true,
    render: () => (
      <div className="p-4 text-[12px] text-ink-faint">
        ผู้ช่วย AI จะมาในเฟสถัดไป
      </div>
    ),
  },
];

export function RightPanel() {
  const { isOpen, setOpen, width, setWidth, activeTab, setActiveTab } = useRightPanel();

  if (!isOpen) {
    // Collapsed rail — 36px-wide vertical strip with a single open button so the
    // panel is always discoverable without consuming layout width.
    return (
      <aside className="hidden md:flex h-screen sticky top-0 w-[36px] shrink-0 border-l border-border-subtle bg-bg-subtle items-start justify-center pt-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md text-ink-faint hover:bg-white hover:text-ink"
          title="เปิดแผงพจนานุกรม"
        >
          <ChevronsRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </aside>
    );
  }

  const active = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <>
      {/* Desktop docked panel */}
      <aside
        className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 border-l border-border-subtle bg-white"
        style={{ width }}
      >
        <Resizer width={width} setWidth={setWidth} />
        <PanelHeader
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setOpen(false)}
        />
        <div className="flex-1 min-h-0 flex flex-col">{active.render()}</div>
      </aside>

      {/* Mobile slide-over */}
      <div className="md:hidden fixed inset-0 z-40">
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-ink/30"
        />
        <aside
          className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-[420px] bg-white border-l border-border-subtle flex flex-col"
        >
          <PanelHeader
            tabs={TABS}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onClose={() => setOpen(false)}
          />
          <div className="flex-1 min-h-0 flex flex-col">{active.render()}</div>
        </aside>
      </div>
    </>
  );
}

function PanelHeader({
  tabs,
  activeTab,
  setActiveTab,
  onClose,
}: {
  tabs: TabDef[];
  activeTab: RightPanelTabId;
  setActiveTab: (t: RightPanelTabId) => void;
  onClose: () => void;
}) {
  return (
    <div className="border-b border-border-subtle">
      <div className="flex items-center px-2 py-1.5 gap-1">
        <div className="flex items-center gap-0.5 flex-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = t.id === activeTab && !t.disabled;
            return (
              <button
                key={t.id}
                onClick={() => !t.disabled && setActiveTab(t.id)}
                disabled={t.disabled}
                type="button"
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] uppercase tracking-wide transition-colors ${
                  isActive
                    ? 'bg-bg-subtle text-ink font-medium'
                    : 'text-ink-faint hover:bg-bg-subtle hover:text-ink-subtle'
                } ${t.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-3 h-3" /> {t.label}
              </button>
            );
          })}
        </div>
        <RightPanelSettings />
        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-md text-ink-faint hover:bg-bg-subtle hover:text-ink"
          title="ปิดแผง"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Thin drag handle on the left edge — drag to resize, persists via context.
 * Pointer-events approach (not native resize) so we can clamp width and keep cursor
 * styling consistent across browsers.
 */
function Resizer({ width, setWidth }: { width: number; setWidth: (px: number) => void }) {
  const draggingRef = useRef(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      // Width measured from the right edge of the viewport.
      const next = window.innerWidth - e.clientX;
      setWidth(next);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [setWidth]);

  return (
    <div
      onPointerDown={(e) => {
        draggingRef.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      }}
      title={`ปรับขนาด (${RIGHT_PANEL_LIMITS.MIN_WIDTH}–${RIGHT_PANEL_LIMITS.MAX_WIDTH}px) — ปัจจุบัน ${width}px`}
      className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors z-10"
    />
  );
}
