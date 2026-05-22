import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';
import { AuthCard, inputClass, labelClass, primaryBtn } from '../../components/auth/AuthCard';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthCard
        title="โปรดตรวจสอบอีเมล"
        subtitle={`หากมีบัญชีที่ใช้ ${email} เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว`}
        footer={
          <Link to="/auth/login" className="text-primary hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        }
      >
        <div />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="ลืมรหัสผ่าน?"
      subtitle="กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้"
      footer={
        <Link to="/auth/login" className="text-primary hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="email">อีเมล</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required autoFocus />
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'กำลังส่ง…' : 'ส่งลิงก์รีเซ็ต'}
        </button>
      </form>
    </AuthCard>
  );
}
