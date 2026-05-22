import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">ไม่พบหน้าที่คุณค้นหา</h1>
      <p className="text-ink-muted mb-4">
        หน้านี้ไม่มีอยู่ในระบบ
      </p>
      <Link to="/templates" className="text-primary underline">
        ไปยังเทมเพลต
      </Link>
    </div>
  );
}
