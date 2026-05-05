import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Plus, User as UserIcon } from 'lucide-react';
import { createUser, listUsers, type UserDto } from '../lib/api/users';
import {
  getCurrentUserId,
  setCurrentUser,
  subscribeCurrentUser,
} from '../lib/currentUser';
import { queryKeys } from '../lib/queryClient';

export function UserSwitcher() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => listUsers(),
  });

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeId, setActiveId] = useState(getCurrentUserId());

  useEffect(() => {
    return subscribeCurrentUser(() => setActiveId(getCurrentUserId()));
  }, []);

  const users = usersQuery.data?.data ?? [];
  const active: UserDto | null =
    users.find((u) => u.id === activeId) ?? null;

  const switchTo = (user: UserDto) => {
    setCurrentUser(user.id);
    // Hard reset: clearing wipes every cached page from the previous identity so
    // the next render re-fetches from scratch with the new x-user-id header.
    queryClient.clear();
    setOpen(false);
    // Send the user back to /documents so they don't stare at a stale detail page
    // for a doc the new identity may not even have access to.
    if (window.location.pathname !== '/documents') {
      window.location.assign('/documents');
    } else {
      // Same route — force a re-render via reload to refresh contexts cleanly.
      window.location.reload();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-default bg-white text-sm hover:border-primary"
      >
        <UserIcon className="w-4 h-4 text-ink-muted" />
        <div className="text-left">
          <div className="font-medium text-ink leading-tight">
            {active?.displayName ?? activeId}
          </div>
          {active?.email ? (
            <div className="text-[10px] text-ink-muted">{active.email}</div>
          ) : null}
        </div>
        <ChevronDown className="w-4 h-4 text-ink-muted" />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-border-default rounded-md shadow-lg z-50">
          <div className="px-3 py-2 text-xs font-medium text-ink-muted uppercase tracking-wide border-b border-border-default">
            Switch user
          </div>
          <div className="max-h-64 overflow-y-auto">
            {users.length === 0 ? (
              <div className="px-3 py-2 text-sm text-ink-muted">
                No users yet — create one below.
              </div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchTo(u)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-alt flex items-center justify-between ${
                    u.id === activeId ? 'bg-surface-alt' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium text-ink">{u.displayName}</div>
                    <div className="text-xs text-ink-muted">{u.email}</div>
                  </div>
                  {u.id === activeId ? (
                    <span className="text-[10px] text-primary uppercase font-medium">
                      Active
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border-default p-2">
            {creating ? (
              <CreateUserForm
                onCreated={(u) => {
                  setCreating(false);
                  switchTo(u);
                }}
                onCancel={() => setCreating(false)}
              />
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm text-primary hover:bg-surface-alt"
              >
                <Plus className="w-4 h-4" /> Create new user
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreateUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: (u: UserDto) => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createUser({ email, displayName }),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      onCreated(user);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim() || !displayName.trim()) return;
        mutation.mutate();
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <input
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="px-2 py-1.5 text-sm rounded border border-border-default focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      {mutation.error ? (
        <div className="text-xs text-red-600">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Failed to create user'}
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary-hover disabled:opacity-50"
        >
          {mutation.isPending ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  );
}
