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
import { Typography } from '@dooform/ui';
import {
  listPublicForms,
  type PublicForm,
  type PublicFormsList,
} from '../lib/dooform-api';
import { TemplateThumbnail } from './template-thumbnail';
import { categoryLabel, formatDate, formatTier, formatType } from '../lib/format';

const PAGE_SIZE = 12;

/* The search input is a single self-closing element so its typography lives
 * here as a constant; the chip and pagination buttons share their own
 * constants below for the same reason. */
const SEARCH_INPUT_CLASS =
  'w-full rounded-full border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10';
const CHIP_BASE_CLASS = 'rounded-full px-3.5 py-1.5 text-xs font-medium transition';
const PAGER_BUTTON_CLASS =
  'inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50';

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
                <Typography
                  variant="body-sm"
                  weight="medium"
                  tone="inherit"
                  className="truncate text-neutral-900 group-hover:text-indigo-600"
                >
                  {t.displayName ?? t.name}
                </Typography>
                {t.description && (
                  <Typography
                    variant="caption"
                    tone="inherit"
                    className="line-clamp-1 text-neutral-500"
                  >
                    {t.description}
                  </Typography>
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
          <Typography as="span" variant="body-sm" tone="inherit" className="text-neutral-700">
            {categoryLabel(row.original.category)}
          </Typography>
        ),
      },
      {
        accessorKey: 'type',
        header: 'ประเภท',
        cell: ({ row }) => (
          <Typography as="span" variant="body-sm" tone="inherit" className="text-neutral-700">
            {formatType(row.original.type)}
          </Typography>
        ),
      },
      {
        accessorKey: 'tier',
        header: 'ระดับ',
        cell: ({ row }) => (
          <Typography
            as="span"
            variant="caption"
            weight="medium"
            tone="inherit"
            className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-700"
          >
            {formatTier(row.original.tier)}
          </Typography>
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
          <Typography as="span" variant="body-sm" tone="inherit" className="text-neutral-500">
            {formatDate(row.original.updatedAt)}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/templates/${row.original.id}`}
            className="inline-flex items-center gap-1 text-neutral-700 hover:text-neutral-900"
          >
            <Typography as="span" variant="body-sm" weight="medium" tone="inherit">
              ดูรายละเอียด
            </Typography>
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
            className={SEARCH_INPUT_CLASS}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCategory('');
              setPage(0);
            }}
            className={`${CHIP_BASE_CLASS} ${
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
              className={`${CHIP_BASE_CLASS} ${
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
                      className="px-6 py-3 text-left text-neutral-500"
                    >
                      <Typography as="span" variant="overline" weight="medium" tone="inherit">
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </Typography>
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
                    className="px-6 py-16 text-center text-red-600"
                  >
                    <Typography as="span" variant="body-sm" tone="inherit">
                      ไม่สามารถโหลดเทมเพลตได้ กรุณาลองใหม่อีกครั้ง
                    </Typography>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-neutral-500"
                  >
                    <Typography as="span" variant="body-sm" tone="inherit">
                      ไม่พบเทมเพลตที่ตรงกับตัวกรอง
                    </Typography>
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
          <Typography variant="caption" tone="inherit" className="text-neutral-600">
            {total > 0 ? (
              <>
                แสดง{' '}
                <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-neutral-900">
                  {page * PAGE_SIZE + 1}
                </Typography>
                –
                <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-neutral-900">
                  {Math.min((page + 1) * PAGE_SIZE, total)}
                </Typography>{' '}
                จาก{' '}
                <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-neutral-900">
                  {total}
                </Typography>{' '}
                รายการ
              </>
            ) : (
              '—'
            )}
          </Typography>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || query.isFetching}
              className={PAGER_BUTTON_CLASS}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              ก่อนหน้า
            </button>
            <Typography as="span" variant="caption" tone="inherit" className="text-neutral-600">
              หน้า {page + 1} จาก {pageCount}
            </Typography>
            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(pageCount - 1, p + 1))
              }
              disabled={page >= pageCount - 1 || query.isFetching}
              className={PAGER_BUTTON_CLASS}
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
