import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { authApi } from '../../lib/auth/api';
import { ApiError } from '../../lib/api/client';

const inputCls =
  'w-full px-3 py-2 border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary';
const labelCls = 'block text-sm font-medium text-ink mb-1';

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [timezone, setTimezone] = useState('');
  const [locale, setLocale] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
    setJobTitle(user.jobTitle ?? '');
    setTimezone(user.timezone ?? '');
    setLocale(user.locale ?? '');
  }, [user]);

  if (!user) return null;

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        name,
        avatarUrl: avatarUrl || '',
        jobTitle: jobTitle || '',
        timezone: timezone || '',
        locale: locale || '',
      });
      setUser(updated);
      setProfileMsg({ kind: 'ok', text: 'บันทึกโปรไฟล์แล้ว' });
    } catch (err) {
      setProfileMsg({ kind: 'err', text: err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ' });
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: 'err', text: 'รหัสผ่านไม่ตรงกัน' });
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPwMsg({
        kind: 'ok',
        text: 'เปลี่ยนรหัสผ่านแล้ว ระบบจะออกจากระบบ — โปรดเข้าสู่ระบบด้วยรหัสผ่านใหม่อีกครั้ง',
      });
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    } catch (err) {
      setPwMsg({ kind: 'err', text: err instanceof ApiError ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-[18px] font-semibold text-ink tracking-tightish">ตั้งค่าโปรไฟล์</h1>
        <p className="text-[12px] text-ink-muted">แก้ไขข้อมูลส่วนตัวของคุณ</p>
      </header>

      <section className="bg-white border border-border-subtle rounded-lg p-6">
        <h2 className="text-[14px] font-semibold text-ink tracking-tightish mb-4">โปรไฟล์</h2>
        <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>อีเมล</label>
            <input value={user.email} disabled className={`${inputCls} bg-surface-alt text-ink-muted`} />
          </div>
          <div>
            <label className={labelCls}>ชื่อที่แสดง</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>ตำแหน่งงาน</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>URL รูปโปรไฟล์</label>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className={inputCls} placeholder="https://…" />
          </div>
          <div>
            <label className={labelCls}>เขตเวลา</label>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls} placeholder="Asia/Bangkok" />
          </div>
          <div>
            <label className={labelCls}>ภาษา</label>
            <input value={locale} onChange={(e) => setLocale(e.target.value)} className={inputCls} placeholder="th-TH" />
          </div>
          {profileMsg ? (
            <div className={`md:col-span-2 text-sm ${profileMsg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {profileMsg.text}
            </div>
          ) : null}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {savingProfile ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-border-subtle rounded-lg p-6">
        <h2 className="text-[14px] font-semibold text-ink tracking-tightish mb-1">เปลี่ยนรหัสผ่าน</h2>
        <p className="text-sm text-ink-muted mb-4">
          ระบบจะออกจากระบบทุกเซสชันหลังเปลี่ยนรหัสผ่าน
        </p>
        <form onSubmit={onChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>รหัสผ่านปัจจุบัน</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>รหัสผ่านใหม่</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className={labelCls}>ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              required
              minLength={8}
            />
          </div>
          {pwMsg ? (
            <div className={`md:col-span-2 text-sm ${pwMsg.kind === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {pwMsg.text}
            </div>
          ) : null}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPw}
              className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {savingPw ? 'กำลังอัปเดต…' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
