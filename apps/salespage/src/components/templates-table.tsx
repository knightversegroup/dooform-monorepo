'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  ArrowRight,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
} from 'lucide-react';
import {
  listPublicForms,
  type PublicForm,
  type PublicFormsList,
} from '../lib/dooform-api';
import { TemplateThumbnail } from './template-thumbnail';
import { categoryLabel, formatDate, formatTier, formatType } from '../lib/format';

const PAGE_SIZE = 12;

export function TemplatesTable() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 250);
    return () => clearTimeout(id);
  }, [search]);

  const query = useQuery<PublicFormsList>({
    queryKey: ['public-forms', { search: debouncedSearch, category, page }],
    queryFn: () =>
      listPublicForms({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const data = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = useMemo<ColumnDef<PublicForm>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ชื่อ
            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        ),
        cell: ({ row }) => {
          const t = row.original;
          return (
            <Link
              href={`/templates/${t.id}`}
              className="group flex items-start gap-3"
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                <TemplateThumbnail
                  id={t.id}
                  alt={t.displayName ?? t.name}
                  variant="card"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-neutral-900 group-hover:text-indigo-600">
                  {t.displayName ?? t.name}
                </div>
                {t.description && (
                  <div className="line-clamp-1 text-xs text-neutral-500">
                    {t.description}
                  </div>
                )}
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'หมวดหมู่',
        cell: ({ row }) => (
          <span className="text-sm text-neutral-700">
            {categoryLabel(row.original.category)}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'ประเภท',
        cell: ({ row }) => (
          <span className="text-sm text-neutral-700">
            {formatType(row.original.type)}
          </span>
        ),
      },
      {
        accessorKey: 'tier',
        header: 'ระดับ',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
            {formatTier(row.original.tier)}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-left"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            อัปเดตล่าสุด
            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-neutral-500">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/templates/${row.original.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            ดูรายละเอียด
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
  });

  // Build category list from the current page's results — quick & no extra endpoint.
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of data) {
      if (t.category) set.add(t.category);
    }
    return Array.from(set).sort();
  }, [data]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเทมเพลต…"
            className="w-full rounded-full border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCategory('');
              setPage(0);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              category === ''
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategory(c);
                setPage(0);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                category === c
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {query.isLoading ? (
                <SkeletonRows columns={columns.length} />
              ) : query.isError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-sm text-red-600"
                  >
                    ไม่สามารถโหลดเทมเพลตได้ กรุณาลองใหม่อีกครั้ง
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-sm text-neutral-500"
                  >
                    ไม่พบเทมเพลตที่ตรงกับตัวกรอง
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-neutral-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-6 py-4 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-3">
          <p className="text-xs text-neutral-600">
            {total > 0 ? (
              <>
                แสดง{' '}
                <span className="font-medium text-neutral-900">
                  {page * PAGE_SIZE + 1}
                </span>
                –
                <span className="font-medium text-neutral-900">
                  {Math.min((page + 1) * PAGE_SIZE, total)}
                </span>{' '}
                จาก{' '}
                <span className="font-medium text-neutral-900">{total}</span>{' '}
                รายการ
              </>
            ) : (
              '—'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || query.isFetching}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              ก่อนหน้า
            </button>
            <span className="text-xs text-neutral-600">
              หน้า {page + 1} จาก {pageCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(pageCount - 1, p + 1))
              }
              disabled={page >= pageCount - 1 || query.isFetching}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ถัดไป
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 w-full max-w-[200px] animate-pulse rounded bg-neutral-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
