import type { FieldDefinition } from './api/types';

/** Default tick character written into the chosen placeholder. */
export const DEFAULT_TICK = '/';

/**
 * Expand a radio-group selection into per-placeholder values.
 * The selected option's placeholder gets the tick character (default `/`),
 * every other option in the group gets an empty string.
 */
export function expandRadioGroup(
  field: FieldDefinition,
  selectedPlaceholder: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  const options = field.radioOptions ?? [];
  for (const opt of options) {
    out[opt.placeholder] =
      opt.placeholder === selectedPlaceholder ? opt.value || DEFAULT_TICK : '';
  }
  return out;
}

/**
 * Walk the form's `values` map and expand every radio-group key into its
 * per-placeholder values. The "master key" (the field.placeholder) is removed
 * from the output because it isn't a real DOCX placeholder.
 */
export function expandAllRadioGroups(
  values: Record<string, string>,
  fields: FieldDefinition[],
): Record<string, string> {
  const out: Record<string, string> = { ...values };
  for (const f of fields) {
    if (!f.isRadioGroup || !f.radioOptions?.length) continue;
    const selected = out[f.placeholder] ?? '';
    delete out[f.placeholder];
    for (const opt of f.radioOptions) {
      out[opt.placeholder] =
        opt.placeholder === selected ? opt.value || DEFAULT_TICK : '';
    }
  }
  return out;
}

/**
 * Inverse: given a per-placeholder values map AND the field definitions,
 * collapse expanded radio rows back into the master key (so the form-fill
 * UI can pre-select the right radio when editing an existing document).
 */
export function collapseRadioGroups(
  values: Record<string, string>,
  fields: FieldDefinition[],
): Record<string, string> {
  const out: Record<string, string> = { ...values };
  for (const f of fields) {
    if (!f.isRadioGroup || !f.radioOptions?.length) continue;
    let selected = '';
    for (const opt of f.radioOptions) {
      const v = out[opt.placeholder];
      if (v && v.trim().length > 0) {
        selected = opt.placeholder;
      }
      delete out[opt.placeholder];
    }
    out[f.placeholder] = selected;
  }
  return out;
}

/** Return the set of placeholder names already consumed by a radio group. */
export function consumedPlaceholders(fields: FieldDefinition[]): Set<string> {
  const set = new Set<string>();
  for (const f of fields) {
    if (!f.isRadioGroup || !f.radioOptions?.length) continue;
    for (const opt of f.radioOptions) set.add(opt.placeholder);
  }
  return set;
}
