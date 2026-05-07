import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import {
  listActiveAnnouncements,
  type Announcement,
} from '../../lib/api/announcements';
import { useAuth } from '../../lib/auth/AuthContext';
import { queryKeys } from '../../lib/queryClient';
import { useCarousel } from './useCarousel';

// How long each announcement stays before the bar rolls to the next one.
const ROTATE_INTERVAL_MS = 6000;
// Must match the Tailwind `duration-500` on the sliding layers below.
const SLIDE_DURATION_MS = 500;

export function AnnouncementBar() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.announcements.active(),
    queryFn: listActiveAnnouncements,
    enabled: Boolean(user),
    refetchInterval: 5 * 60_000,
    staleTime: 60_000,
  });
  const announcements = query.data ?? [];

  const { index, nextIndex, animating } = useCarousel({
    count: announcements.length,
    intervalMs: ROTATE_INTERVAL_MS,
    transitionMs: SLIDE_DURATION_MS,
  });

  if (announcements.length === 0) return null;

  return (
    <div className="flex h-9 shrink-0 bg-purple-900 font-semibold text-white">
      <div className="relative flex-1 min-w-0 overflow-hidden">
        <Slide
          announcement={announcements[index]}
          animating={animating}
          role="outgoing"
        />
        {announcements.length > 1 ? (
          <Slide
            announcement={announcements[nextIndex]}
            animating={animating}
            role="incoming"
          />
        ) : null}
      </div>
      <Clock />
    </div>
  );
}

// One slide layer in the bar. Two layers stack absolutely; their resting and
// animating positions are mirrored so the pair "spins" together — outgoing
// rolls up out of frame while incoming rolls in from below.
function Slide({
  announcement,
  animating,
  role,
}: {
  announcement: Announcement;
  animating: boolean;
  role: 'outgoing' | 'incoming';
}) {
  const transitionCls = animating
    ? 'transition-transform duration-500 ease-in-out'
    : '';
  const translateCls =
    role === 'outgoing'
      ? animating
        ? '-translate-y-full'
        : 'translate-y-0'
      : animating
        ? 'translate-y-0'
        : 'translate-y-full';

  return (
    <div className={`absolute inset-0 ${transitionCls} ${translateCls}`}>
      <SlideContent announcement={announcement} />
    </div>
  );
}

function SlideContent({ announcement }: { announcement: Announcement }) {
  const message = announcement.message?.trim() ?? '';
  const linkText = announcement.linkText?.trim() ?? '';
  const href = announcement.linkUrl?.trim() || null;

  const body = (
    <span className="flex min-w-0 items-center gap-2 text-white/90 hover:text-white">
      <span className="truncate">{message}</span>
      {linkText ? (
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 font-medium text-white">
          {linkText}
          {href ? <ArrowRight className="w-3 h-3" /> : null}
        </span>
      ) : href ? (
        <ArrowRight className="w-3 h-3 shrink-0" />
      ) : null}
    </span>
  );

  return (
    <div className="flex h-full items-center gap-4 px-4 sm:px-6">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1"
        >
          {body}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1">{body}</div>
      )}
    </div>
  );
}

function Clock() {
  const now = useNow(1000);
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const date = now.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return (
    <div
      title={date}
      className="flex shrink-0 items-center border-l border-white/10 px-3 sm:px-4 font-mono tabular-nums tracking-tight"
    >
      {time}
    </div>
  );
}

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
