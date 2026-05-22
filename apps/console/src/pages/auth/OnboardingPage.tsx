import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';
import { AuthCard, inputClass, labelClass, primaryBtn } from '../../components/auth/AuthCard';

const TIMEZONE_GUESS = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
})();

const LOCALE_GUESS = (() => {
  try {
    return navigator.language || '';
  } catch {
    return '';
  }
})();

export default function OnboardingPage() {
  const { user, setUser, status } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [timezone, setTimezone] = useState(TIMEZONE_GUESS);
  const [locale, setLocale] = useState(LOCALE_GUESS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
    setJobTitle(user.jobTitle ?? '');
    if (user.timezone) setTimezone(user.timezone);
    if (user.locale) setLocale(user.locale);
  }, [user]);

  // Redirect away if already onboarded or unauthenticated.
  useEffect(() => {
    if (status === 'unauthenticated') navigate('/auth/login', { replace: true });
    else if (user?.onboarded) navigate('/', { replace: true });
  }, [status, user, navigate]);

  if (status === 'loading' || !user) {
    return <AuthCard title="กำลังโหลด…"><div /></AuthCard>;
  }

  const isOrgAdmin = user.role === 'ORG_ADMIN' || user.role === 'GLOBAL_ADMIN';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await authApi.completeOnboarding({
        name,
        avatarUrl: avatarUrl || undefined,
        organizationName: isOrgAdmin && organizationName ? organizationName : undefined,
        jobTitle: jobTitle || undefined,
        timezone: timezone || undefined,
        locale: locale || undefined,
      });
      setUser(updated);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกโปรไฟล์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={`ยินดีต้อนรับ, ${user.name || 'คุณ'}!`}
      subtitle="กรอกข้อมูลเล็กน้อยก่อนเริ่มต้นใช้งาน"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor="name">ชื่อที่แสดง</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="avatarUrl">URL รูปโปรไฟล์ <span className="text-ink-muted font-normal">(ไม่บังคับ)</span></label>
          <input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className={inputClass} placeholder="https://…" />
        </div>
        <div>
          <label className={labelClass} htmlFor="jobTitle">ตำแหน่งงาน <span className="text-ink-muted font-normal">(ไม่บังคับ)</span></label>
          <input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
        </div>
        {isOrgAdmin ? (
          <div>
            <label className={labelClass} htmlFor="org">ชื่อองค์กร</label>
            <input
              id="org"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className={inputClass}
              placeholder="เว้นว่างเพื่อใช้ค่าปัจจุบัน"
            />
            <div className="text-xs text-ink-muted mt-1">เห็นได้เฉพาะผู้ดูแลองค์กรเท่านั้น</div>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="timezone">เขตเวลา</label>
            <input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass} placeholder="Asia/Bangkok" />
          </div>
          <div>
            <label className={labelClass} htmlFor="locale">ภาษา</label>
            <input id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} className={inputClass} placeholder="th-TH" />
          </div>
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? 'กำลังบันทึก…' : 'ไปยัง Dooform'}
        </button>
      </form>
    </AuthCard>
  );
}
