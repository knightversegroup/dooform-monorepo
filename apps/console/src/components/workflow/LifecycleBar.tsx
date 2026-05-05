import { Check } from 'lucide-react';
import {
  LIFECYCLE_ORDER,
  type LifecycleStatus,
} from '../../lib/api/lifecycle';

const LABELS: Record<LifecycleStatus, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  SIGNED: 'Signed',
  ARCHIVED: 'Archived',
};

interface LifecycleBarProps {
  current: LifecycleStatus;
}

export function LifecycleBar({ current }: LifecycleBarProps) {
  const currentIndex = LIFECYCLE_ORDER.indexOf(current);
  return (
    <ol className="flex items-stretch gap-0 w-full">
      {LIFECYCLE_ORDER.map((status, idx) => {
        const reached = idx <= currentIndex;
        const isActive = idx === currentIndex;
        return (
          <li
            key={status}
            className={`flex-1 flex items-center gap-2 px-3 py-2 text-xs font-medium border-y border-r border-border-default first:rounded-l-md last:rounded-r-md first:border-l ${
              isActive
                ? 'bg-primary text-white border-primary'
                : reached
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-white text-ink-muted'
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${
                isActive
                  ? 'bg-white text-primary border-white'
                  : reached
                    ? 'bg-primary text-white border-primary'
                    : 'border-border-default'
              }`}
            >
              {reached && !isActive ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="text-[10px]">{idx + 1}</span>
              )}
            </span>
            <span className="truncate">{LABELS[status]}</span>
          </li>
        );
      })}
    </ol>
  );
}
