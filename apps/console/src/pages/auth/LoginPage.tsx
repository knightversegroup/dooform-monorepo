import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { ApiError } from '../../lib/api/client';
import { AuthCard, inputClass, labelClass, primaryBtn } from '../../components/auth/AuthCard';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="เข้าสู่ระบบ"
      subtitle="ยินดีต้อนรับกลับมา เข้าสู่ระบบเพื่อใช้งานต่อ"
      footer={
        <>
          ยังไม่มีบัญชี?{' '}
          <Link to="/auth/register" className="text-primary hover:underline">
            สมัครสมาชิก
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="email">อีเมล</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
          <div className="text-right mt-1">
            <Link to="/auth/forgot-password" className="text-xs text-ink-muted hover:text-primary">
              ลืมรหัสผ่าน?
            </Link>
          </div>
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </AuthCard>
  );
}
