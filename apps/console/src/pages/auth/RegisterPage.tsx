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
      setError(err instanceof ApiError ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="สร้างบัญชีของคุณ"
      subtitle="เริ่มต้นด้วยทดลองใช้แพ็กเกจ Pro ฟรี 14 วัน"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            เข้าสู่ระบบ
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
          สร้างองค์กรใหม่
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
          เข้าร่วมด้วยรหัสเชิญ
        </button>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="name">ชื่อ-นามสกุล</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">อีเมล</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">รหัสผ่าน</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={8} />
          <div className="text-xs text-ink-muted mt-1">อย่างน้อย 8 ตัวอักษร</div>
        </div>
        {mode === 'create' ? (
          <div>
            <label className={labelClass} htmlFor="org">ชื่อองค์กร</label>
            <input id="org" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} className={inputClass} required />
          </div>
        ) : (
          <div>
            <label className={labelClass} htmlFor="invite">รหัสเชิญ</label>
            <input id="invite" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className={inputClass} required />
          </div>
        )}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'กำลังสร้างบัญชี…' : 'สร้างบัญชี'}
        </button>
      </form>
    </AuthCard>
  );
}
