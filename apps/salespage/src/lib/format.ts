const TIER_LABELS: Record<string, string> = {
  FREE: 'ฟรี',
  BASIC: 'พื้นฐาน',
  PRO: 'โปร',
  PREMIUM: 'พรีเมียม',
  ENTERPRISE: 'องค์กร',
};

const TYPE_LABELS: Record<string, string> = {
  FORM: 'แบบฟอร์ม',
  SURVEY: 'แบบสำรวจ',
  QUIZ: 'แบบทดสอบ',
  OFFICIAL: 'เอกสารทางการ',
  PRIVATE: 'เอกสารส่วนตัว',
  COMMUNITY: 'ของชุมชน',
};

const CATEGORY_LABELS: Record<string, string> = {
  FREQUENTLY_USED: 'ใช้งานบ่อย',
  IDENTIFICATION: 'เอกสารยืนยันตัวตน',
  CERTIFICATE: 'ใบรับรอง',
  CONTRACT: 'สัญญา',
  APPLICATION: 'ใบสมัคร',
  FINANCIAL: 'การเงิน',
  GOVERNMENT: 'ราชการ',
  EDUCATION: 'การศึกษา',
  MEDICAL: 'การแพทย์',
  OTHER: 'อื่น ๆ',
  GENERAL: 'ทั่วไป',
};

export function formatTier(tier: string): string {
  return TIER_LABELS[tier.toUpperCase()] ?? tier;
}

export function formatType(type: string): string {
  return TYPE_LABELS[type.toUpperCase()] ?? type;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function categoryLabel(category?: string | null): string {
  if (!category) return 'ทั่วไป';
  const key = category.toUpperCase();
  return CATEGORY_LABELS[key] ?? category;
}
