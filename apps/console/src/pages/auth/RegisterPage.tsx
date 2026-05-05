import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { ApiError } from '../../lib/api/client';
import { AuthCard, inputClass, labelClass, primaryBtn } from '../../components/auth/AuthCard';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialInvite = params.get('invite') ?? '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [inviteCode, setInviteCode] = useState(initialInvite);
  const [mode, setMode] = useState<'create' | 'join'>(initialInvite ? 'join' : 'create');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialInvite) setMode('join');
  }, [initialInvite]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email,
        password,
        name,
        organizationName: mode === 'create' ? organizationName : undefined,
        inviteCode: mode === 'join' ? inviteCode : undefined,
      });
      navigate('/auth/onboarding', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start with a 14-day free trial of the Pro tier."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="flex gap-2 mb-4 text-xs">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 px-3 py-1.5 rounded-md border ${
            mode === 'create'
              ? 'border-primary bg-primary text-white'
              : 'border-border-default text-ink-muted'
          }`}
        >
          Create organization
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 px-3 py-1.5 rounded-md border ${
            mode === 'join'
              ? 'border-primary bg-primary text-white'
              : 'border-border-default text-ink-muted'
          }`}
        >
          Join with invite code
        </button>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="name">Full name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={8} />
          <div className="text-xs text-ink-muted mt-1">At least 8 characters.</div>
        </div>
        {mode === 'create' ? (
          <div>
            <label className={labelClass} htmlFor="org">Organization name</label>
            <input id="org" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} className={inputClass} required />
          </div>
        ) : (
          <div>
            <label className={labelClass} htmlFor="invite">Invite code</label>
            <input id="invite" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className={inputClass} required />
          </div>
        )}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
