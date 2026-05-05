import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_OPEN = 'right-panel:open';
const STORAGE_WIDTH = 'right-panel:width';
const STORAGE_TAB = 'right-panel:tab';
const STORAGE_DEFAULT_SCOPE = 'right-panel:dictionary:default-scope';

const DEFAULT_WIDTH = 360;
const MIN_WIDTH = 280;
const MAX_WIDTH = 560;

export type RightPanelTabId = 'dictionary' | 'ai';

interface RightPanelContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  width: number;
  setWidth: (px: number) => void;
  activeTab: RightPanelTabId;
  setActiveTab: (tab: RightPanelTabId) => void;
  /** Persisted user preference for the dictionary scope filter. */
  defaultScope: 'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL';
  setDefaultScope: (s: 'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL') => void;
}

const RightPanelContext = createContext<RightPanelContextValue | null>(null);

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(key);
  if (v === null) return fallback;
  return v === '1';
}
function readNumber(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}
function readString<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(key) as T | null;
  return v && allowed.includes(v) ? v : fallback;
}

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => readBool(STORAGE_OPEN, false));
  const [width, setWidthState] = useState(() => {
    const w = readNumber(STORAGE_WIDTH, DEFAULT_WIDTH);
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w));
  });
  const [activeTab, setActiveTabState] = useState<RightPanelTabId>(() =>
    readString<RightPanelTabId>(STORAGE_TAB, 'dictionary', ['dictionary', 'ai'] as const),
  );
  const [defaultScope, setDefaultScopeState] = useState<
    'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL'
  >(() =>
    readString<'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL'>(
      STORAGE_DEFAULT_SCOPE,
      'ALL',
      ['ALL', 'PERSONAL', 'ORGANIZATION', 'GLOBAL'] as const,
    ),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_OPEN, isOpen ? '1' : '0');
  }, [isOpen]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_WIDTH, String(width));
  }, [width]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_TAB, activeTab);
  }, [activeTab]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_DEFAULT_SCOPE, defaultScope);
  }, [defaultScope]);

  const setWidth = useCallback((px: number) => {
    setWidthState(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(px))));
  }, []);
  const setOpen = useCallback((v: boolean) => setIsOpen(v), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const setActiveTab = useCallback((t: RightPanelTabId) => setActiveTabState(t), []);
  const setDefaultScope = useCallback(
    (s: 'ALL' | 'PERSONAL' | 'ORGANIZATION' | 'GLOBAL') => setDefaultScopeState(s),
    [],
  );

  const value = useMemo<RightPanelContextValue>(
    () => ({
      isOpen,
      setOpen,
      toggle,
      width,
      setWidth,
      activeTab,
      setActiveTab,
      defaultScope,
      setDefaultScope,
    }),
    [isOpen, setOpen, toggle, width, setWidth, activeTab, setActiveTab, defaultScope, setDefaultScope],
  );

  return <RightPanelContext.Provider value={value}>{children}</RightPanelContext.Provider>;
}

export function useRightPanel(): RightPanelContextValue {
  const ctx = useContext(RightPanelContext);
  if (!ctx) throw new Error('useRightPanel must be used within a RightPanelProvider');
  return ctx;
}

export const RIGHT_PANEL_LIMITS = { MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH };
