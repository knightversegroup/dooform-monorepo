import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import {
  getDocumentType,
  listDocumentTypeTemplates,
} from '../lib/api/documentTypes';
import { getThumbnailUrl } from '../lib/api/templates';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { PageLoader } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function TemplateGroupPage() {
  const { documentTypeId = '' } = useParams();

  const docTypeQuery = useQuery({
    queryKey: queryKeys.documentTypes.detail(documentTypeId),
    queryFn: () => getDocumentType(documentTypeId),
    enabled: !!documentTypeId,
  });

  const templatesQuery = useQuery({
    queryKey: queryKeys.documentTypes.templates(documentTypeId),
    queryFn: () => listDocumentTypeTemplates(documentTypeId),
    enabled: !!documentTypeId,
  });

  return (
    <div>
      <PageHeader
        title={docTypeQuery.data?.name ?? 'Document type'}
        description={docTypeQuery.data?.description ?? undefined}
        breadcrumbs={
          <Link
            to="/templates"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Templates
          </Link>
        }
      />
      <section className="px-6 py-6">
        {templatesQuery.isLoading ? <PageLoader /> : null}
        {templatesQuery.error ? <ErrorMessage error={templatesQuery.error} /> : null}
        {templatesQuery.data?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templatesQuery.data.map((tpl) => (
              <Link
                key={tpl.id}
                to={`/templates/${tpl.id}`}
                className="group rounded-md border border-border-default overflow-hidden hover:border-primary bg-white transition-colors"
              >
                <div className="aspect-[4/3] bg-surface-alt overflow-hidden">
                  <img
                    src={getThumbnailUrl(tpl.id)}
                    alt={tpl.displayName ?? tpl.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3">
                  <div className="font-medium text-ink line-clamp-2 group-hover:text-primary">
                    {tpl.displayName ?? tpl.name}
                  </div>
                  {tpl.variantName ? (
                    <div className="text-xs text-ink-muted mt-1">{tpl.variantName}</div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : !templatesQuery.isLoading ? (
          <p className="text-sm text-ink-muted">No templates in this group yet.</p>
        ) : null}
      </section>
    </div>
  );
}
