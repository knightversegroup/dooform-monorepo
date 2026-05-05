import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import {
  Archive,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  Globe,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  archiveTemplate,
  deleteTemplate,
  getThumbnailUrl,
  listTemplates,
  publishTemplate,
  unpublishTemplate,
} from '../lib/api/templates';
import {
  listDocumentTypes,
  listDocumentTypeCategories,
} from '../lib/api/documentTypes';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { Template } from '../lib/api/types';
import { useCan } from '../lib/auth/useCan';
import { useTemplateOwnership } from '../lib/auth/useTemplateOwnership';

const PAGE_SIZE = 20;

export default function TemplatesPage() {
  const canCreateTemplate = useCan('templates:create');
  const canUpdateTemplate = useCan('templates:update');
  const canDeleteTemplate = useCan('templates:delete');
  const { canEdit: canEditTemplate, canDelete: canDeleteOwnedTemplate } =
    useTemplateOwnership();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const params = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      page: page - 1,
      pageSize: PAGE_SIZE,
    }),
    [search, category, status, page]
  );

  const templatesQuery = useQuery({
    queryKey: queryKeys.templates.list(params),
    queryFn: () => listTemplates(params),
  });

  const docTypesQuery = useQuery({
    queryKey: queryKeys.documentTypes.list(),
    queryFn: () => listDocumentTypes(),
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.documentTypes.categories(),
    queryFn: () => listDocumentTypeCategories(),
  });

  const data = templatesQuery.data?.data ?? [];
  const total = templatesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
  };

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishTemplate(id),
    onSuccess: invalidate,
  });
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublishTemplate(id),
    onSuccess: invalidate,
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveTemplate(id),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: invalidate,
  });

  const columns = useMemo<ColumnDef<Template>[]>(
    () => [
      {
        id: 'select',
        size: 32,
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-3.5 w-3.5 rounded border-border-default accent-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            title={
              row.getCanSelect()
                ? undefined
                : 'Only the template owner or a global admin can act on this template'
            }
            className="h-3.5 w-3.5 rounded border-border-default accent-primary disabled:cursor-not-allowed disabled:opacity-40"
          />
        ),
        enableSorting: false,
      },
      {
        id: 'thumbnail',
        header: '',
        size: 56,
        cell: ({ row }) => (
          <div className="h-10 w-10 rounded border border-border-subtle bg-bg-subtle overflow-hidden flex items-center justify-center">
            <img
              src={getThumbnailUrl(row.original.id)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'displayName',
        header: ({ column }) => (
          <SortHeader label="Name" column={column} />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              to={`/templates/${row.original.id}`}
              className="font-medium text-ink hover:text-primary text-[13px] truncate block"
            >
              {row.original.displayName ?? row.original.name}
            </Link>
            {row.original.description ? (
              <div className="text-[11px] text-ink-faint truncate">
                {row.original.description}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => <SortHeader label="Type" column={column} />,
        cell: ({ getValue }) => (
          <span className="text-[12px] text-ink-muted">
            {String(getValue() ?? '—')}
          </span>
        ),
      },
      {
        accessorKey: 'tier',
        header: ({ column }) => <SortHeader label="Tier" column={column} />,
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge tone="info" caps>
              {String(getValue())}
            </Badge>
          ) : (
            <span className="text-ink-faint text-[12px]">—</span>
          ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <SortHeader label="Category" column={column} />
        ),
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge tone="muted" caps>
              {String(getValue()).replace(/_/g, ' ')}
            </Badge>
          ) : (
            <span className="text-ink-faint text-[12px]">—</span>
          ),
      },
      {
        accessorKey: 'visibility',
        header: ({ column }) => (
          <SortHeader label="Visibility" column={column} />
        ),
        cell: ({ getValue }) => {
          const v = getValue() as string | null | undefined;
          if (!v) return <span className="text-ink-faint text-[12px]">—</span>;
          return (
            <Badge tone={v === 'GLOBAL' ? 'accent' : 'muted'} caps>
              {v}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <SortHeader label="Status" column={column} />,
        cell: ({ getValue }) => <StatusBadge status={String(getValue() ?? 'DRAFT')} />,
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <SortHeader label="Updated" column={column} />
        ),
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="text-[12px] text-ink-muted whitespace-nowrap">
              {new Date(String(getValue())).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-ink-faint text-[12px]">—</span>
          ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // A row is selectable only when the current user actually has edit rights
    // over it (owner or GLOBAL_ADMIN). The same rule is enforced on the server,
    // but blocking selection up-front avoids dead-end clicks.
    enableRowSelection: (row) => canEditTemplate(row.original),
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original.id);
  const selectedCount = selectedIds.length;
  const canBulkDelete = selectedRows.every((r) => canDeleteOwnedTemplate(r.original));
  const isMutating =
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  const runBulk = async (
    label: string,
    confirmMsg: string,
    fn: (id: string) => Promise<unknown>,
  ) => {
    if (!selectedCount) return;
    if (!confirm(`${confirmMsg} (${selectedCount})`)) return;
    for (const id of selectedIds) {
      try {
        await fn(id);
      } catch (err) {
        console.error(`${label} failed for ${id}`, err);
      }
    }
    setRowSelection({});
    invalidate();
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Templates"
        description="Browse, manage, and bulk-edit templates."
        actions={
          canCreateTemplate ? (
            <Link to="/templates/new">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" /> Upload template
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="px-6 py-3 flex flex-col md:flex-row gap-2 border-b border-border-subtle bg-white">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search templates…"
            className="pl-8"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">All categories</option>
          {(categoriesQuery.data?.categories ?? []).map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-2.5 py-1.5 rounded-md border border-border-subtle bg-white text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {selectedCount > 0 ? (
        <div className="px-6 py-2 flex items-center gap-2 border-b border-border-subtle bg-bg-subtle">
          <span className="text-[12px] text-ink-muted">
            {selectedCount} selected
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {canUpdateTemplate ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isMutating}
                  onClick={() =>
                    runBulk('publish', 'Publish selected templates?', (id) =>
                      publishMutation.mutateAsync(id),
                    )
                  }
                >
                  <Globe className="w-3.5 h-3.5" /> Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isMutating}
                  onClick={() =>
                    runBulk('unpublish', 'Unpublish selected templates?', (id) =>
                      unpublishMutation.mutateAsync(id),
                    )
                  }
                >
                  <FileEdit className="w-3.5 h-3.5" /> Unpublish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isMutating}
                  onClick={() =>
                    runBulk('archive', 'Archive selected templates?', (id) =>
                      archiveMutation.mutateAsync(id),
                    )
                  }
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </Button>
              </>
            ) : null}
            {canDeleteTemplate ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isMutating || !canBulkDelete}
                title={
                  canBulkDelete
                    ? undefined
                    : 'Some selected templates are not yours — only the owner or a global admin can delete them.'
                }
                onClick={() =>
                  runBulk(
                    'delete',
                    'Delete selected templates? This cannot be undone.',
                    (id) => deleteMutation.mutateAsync(id),
                  )
                }
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <section className="px-6 py-5">
        {docTypesQuery.data?.length ? (
          <div className="mb-6">
            <h2 className="text-[10px] font-medium text-ink-faint uppercase tracking-wider mb-2">
              Document type groups
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {docTypesQuery.data.map((dt) => (
                <Link
                  key={dt.id}
                  to={`/templates/group/${dt.id}`}
                  className="border border-border-subtle rounded-md px-3 py-2.5 bg-white hover:bg-bg-subtle transition-colors"
                >
                  <div className="font-medium text-ink text-[13px] truncate">
                    {dt.name}
                  </div>
                  {dt.category ? (
                    <div className="text-[11px] text-ink-faint mt-0.5">
                      {dt.category.replace(/_/g, ' ')}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <h2 className="text-[10px] font-medium text-ink-faint uppercase tracking-wider mb-2">
          All templates
        </h2>

        {templatesQuery.isLoading ? <PageLoader /> : null}
        {templatesQuery.error ? (
          <ErrorMessage error={templatesQuery.error} />
        ) : null}

        {!templatesQuery.isLoading && !templatesQuery.error ? (
          data.length === 0 ? (
            <p className="text-[13px] text-ink-muted">No templates found.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border-subtle bg-white">
              <table className="w-full text-[13px]">
                <thead className="bg-bg-subtle text-ink-muted">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-border-subtle">
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-3 py-2 text-left font-medium text-[11px] uppercase tracking-wider"
                          style={{
                            width: header.getSize() < 100 ? header.getSize() : undefined,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-border-subtle hover:bg-bg-subtle/60 ${
                        row.getIsSelected() ? 'bg-primary/5' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between text-[12px]">
            <span className="text-ink-muted">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SortHeader({
  label,
  column,
}: {
  label: string;
  column: { getCanSort: () => boolean; getToggleSortingHandler: () => ((e: unknown) => void) | undefined; getIsSorted: () => false | 'asc' | 'desc' };
}) {
  if (!column.getCanSort()) return <span>{label}</span>;
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="inline-flex items-center gap-1 hover:text-ink"
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${sorted ? 'text-ink' : 'text-ink-faint'}`}
      />
      {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : ''}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'PUBLISHED'
      ? 'success'
      : status === 'ARCHIVED'
      ? 'muted'
      : 'warn';
  return (
    <Badge tone={tone as 'success' | 'muted' | 'warn'} caps>
      {status}
    </Badge>
  );
}
