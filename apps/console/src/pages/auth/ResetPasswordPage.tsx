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
        title="ลิงก์ไม่ถูกต้อง"
        subtitle="ลิงก์รีเซ็ตรหัสผ่านนี้ไม่มีโทเค็น"
        footer={
          <Link to="/auth/forgot-password" className="text-primary hover:underline">
            ขอลิงก์ใหม่
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
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthCard
        title="อัปเดตรหัสผ่านแล้ว"
        subtitle="คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว"
      >
        <button className={primaryBtn} onClick={() => navigate('/auth/login', { replace: true })}>
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="ตั้งรหัสผ่านใหม่">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="password">รหัสผ่านใหม่</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required minLength={8} />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm">ยืนยันรหัสผ่าน</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} required minLength={8} />
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'กำลังอัปเดต…' : 'อัปเดตรหัสผ่าน'}
        </button>
      </form>
    </AuthCard>
  );
}
