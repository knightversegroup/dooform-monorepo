import { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';
import { useRightPanel, RIGHT_PANEL_LIMITS } from './RightPanelContext';

/**
 * Inline settings popover for the right panel — wired up for the dictionary scope
 * preference and panel width. Future tabs (AI) can extend this with their own block.
 */
export function RightPanelSettings() {
  const [open, setOpen] = useState(false);
  const { width, setWidth, defaultScope, setDefaultScope } = useRightPanel();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-ink-faint hover:bg-bg-subtle hover:text-ink transition-colors"
        title="Panel settings"
        type="button"
      >
        <SettingsIcon className="w-3.5 h-3.5" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-md border border-border-subtle bg-white shadow-lg p-3 text-[12px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">Settings</span>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-faint hover:text-ink"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="text-ink-muted mb-1">Default dictionary scope</div>
            <div className="grid grid-cols-2 gap-1">
              {(['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDefaultScope(s)}
                  className={`px-2 py-1 rounded text-[11px] uppercase tracking-wide ${
                    defaultScope === s
                      ? 'bg-primary text-white'
                      : 'bg-bg-subtle text-ink-subtle hover:text-ink'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-ink-muted mb-1 flex items-center justify-between">
              <span>Panel width</span>
              <span className="text-ink-faint">{width}px</span>
            </div>
            <input
              type="range"
              min={RIGHT_PANEL_LIMITS.MIN_WIDTH}
              max={RIGHT_PANEL_LIMITS.MAX_WIDTH}
              step={8}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
