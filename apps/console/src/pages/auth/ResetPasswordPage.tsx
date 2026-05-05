import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';
import { AuthCard, inputClass, labelClass, primaryBtn } from '../../components/auth/AuthCard';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthCard
        title="Invalid link"
        subtitle="This password reset link is missing a token."
        footer={
          <Link to="/auth/forgot-password" className="text-primary hover:underline">
            Request a new link
          </Link>
        }
      >
        <div />
      </AuthCard>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard
        title="Password updated"
        subtitle="You can now log in with your new password."
      >
        <button className={primaryBtn} onClick={() => navigate('/auth/login', { replace: true })}>
          Back to log in
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="password">New password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={8} />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} required minLength={8} />
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthCard>
  );
}
