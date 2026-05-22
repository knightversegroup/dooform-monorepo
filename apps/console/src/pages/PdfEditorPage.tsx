import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { PdfEditor } from '../features/pdf-editor/PdfEditor';

export default function PdfEditorPage() {
  const { documentId = '' } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="ตัวแก้ไข PDF"
        description="เพิ่มข้อความหรือเส้นขีดฆ่าทับ แล้วยืนยันผลลัพธ์สุดท้าย"
        breadcrumbs={
          <Link
            to={`/documents/${documentId}`}
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" /> กลับไปยังเอกสาร
          </Link>
        }
      />
      <div className="px-6 py-6">
        {documentId ? (
          <PdfEditor
            documentId={documentId}
            onFinalized={() => navigate(`/documents/${documentId}`)}
          />
        ) : (
          <p className="text-sm text-ink-muted">ไม่พบรหัสเอกสาร</p>
        )}
      </div>
    </div>
  );
}
