import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Upload } from 'lucide-react';
import { createTemplate } from '../lib/api/templates';
import { taxonomyApi } from '../lib/api/templateTaxonomy';
import { authApi } from '../lib/auth/api';
import { queryKeys } from '../lib/queryClient';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../lib/auth/AuthContext';

export default function TemplateUploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';

  // Pull the configurable lists from the API. Falls back to an empty list while loading;
  // the form just renders the loaded options.
  const typesQuery = useQuery({
    queryKey: ['template-taxonomy', 'TYPE'],
    queryFn: () => taxonomyApi.listByKind('TYPE'),
  });
  // Pull tiers from the unified subscription tier table (same source as
  // /settings/tiers admin and the org Subscription card).
  const tiersQuery = useQuery({
    queryKey: ['tiers', 'public'],
    queryFn: () => authApi.listEnabledTiers(),
    enabled: isGlobalAdmin,
  });
  const categoriesQuery = useQuery({
    queryKey: ['template-taxonomy', 'CATEGORY'],
    queryFn: () => taxonomyApi.listByKind('CATEGORY'),
  });
  const types = typesQuery.data ?? [];
  const tiers = tiersQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  // Initial state is empty — populated below from the first option of each loaded list.
  // Avoids the "stuck dropdown" where the initial value doesn't match any option.
  const [type, setType] = useState<string>('');
  const [tier, setTier] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  // Once each list loads, default to the first option if the user hasn't picked yet.
  useEffect(() => {
    if (!type && types.length) setType(types[0].code);
  }, [types, type]);
  useEffect(() => {
    if (!tier && tiers.length) setTier(tiers[0].code);
  }, [tiers, tier]);
  useEffect(() => {
    if (!category && categories.length) setCategory(categories[0].code);
  }, [categories, category]);
  const [pageOrientation, setPageOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [visibility, setVisibility] = useState<'ORGANIZATION' | 'GLOBAL'>('ORGANIZATION');

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Please choose a DOCX file.');
      if (!name.trim()) throw new Error('Please provide a template name.');
      return createTemplate({
        file,
        name,
        displayName: displayName || undefined,
        description: description || undefined,
        author: author || undefined,
        type,
        tier: isGlobalAdmin ? tier : undefined,
        category,
        pageOrientation,
        visibility: isGlobalAdmin ? visibility : undefined,
      });
    },
    onSuccess: (tpl) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
      navigate(`/templates/${tpl.id}`);
    },
  });

  return (
    <div>
      <PageHeader
        title="Upload template"
        description="Upload a DOCX file with {{placeholders}}. Fields will be auto-detected."
        breadcrumbs={
          <Link
            to="/templates"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Templates
          </Link>
        }
      />

      <form
        className="px-6 py-6 max-w-2xl flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          uploadMutation.mutate();
        }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-ink-subtle">DOCX file</label>
          <label className="inline-flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border-default rounded-md cursor-pointer hover:border-primary hover:bg-surface-alt text-sm">
            <Upload className="w-5 h-5 text-ink-muted" />
            <span>{file ? file.name : 'Click to choose a .docx file'}</span>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <Input label="Name *" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-ink-subtle">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-border-default bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Input label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-subtle">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-md border border-border-default bg-white text-sm"
            >
              {types.length === 0 ? <option value="">Loading…</option> : null}
              {types.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          {isGlobalAdmin ? (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink-subtle">Tier</span>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="px-3 py-2 rounded-md border border-border-default bg-white text-sm"
              >
                {tiers.length === 0 ? <option value="">Loading…</option> : null}
                {tiers.map((t) => (
                  <option key={t.id} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-ink-muted">Global admin only.</span>
            </label>
          ) : null}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-subtle">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-border-default bg-white text-sm"
            >
              {categories.length === 0 ? <option value="">Loading…</option> : null}
              {categories.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink-subtle">Page orientation</span>
            <select
              value={pageOrientation}
              onChange={(e) => setPageOrientation(e.target.value as 'PORTRAIT' | 'LANDSCAPE')}
              className="px-3 py-2 rounded-md border border-border-default bg-white text-sm"
            >
              <option value="PORTRAIT">Portrait</option>
              <option value="LANDSCAPE">Landscape</option>
            </select>
          </label>
          {isGlobalAdmin ? (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink-subtle">Visibility</span>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'ORGANIZATION' | 'GLOBAL')}
                className="px-3 py-2 rounded-md border border-border-default bg-white text-sm"
              >
                <option value="ORGANIZATION">Organization (default)</option>
                <option value="GLOBAL">Global — visible to all tenants</option>
              </select>
              <span className="text-[11px] text-ink-muted">
                Global templates are visible to every organization.
              </span>
            </label>
          ) : null}
        </div>

        {uploadMutation.error ? <ErrorMessage error={uploadMutation.error} /> : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/templates')}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploadMutation.isPending || !file || !name.trim()}>
            {uploadMutation.isPending ? <Spinner className="text-white" /> : <Upload className="w-4 h-4" />}
            Upload template
          </Button>
        </div>
      </form>
    </div>
  );
}
