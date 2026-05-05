/** Strip a trailing `.docx` extension for display in inputs and headings. */
export function stripDocxExtension(name: string | null | undefined): string {
  return (name ?? '').replace(/\.docx$/i, '');
}

/** Resolve a user-typed name back to the canonical `<name>.docx` form. */
export function withDocxExtension(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  return /\.docx$/i.test(trimmed) ? trimmed : `${trimmed}.docx`;
}
