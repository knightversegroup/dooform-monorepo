import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

/**
 * Salespage typography enforcement.
 *
 * Bans raw `text-{size}` / `font-{weight}` / `leading-*` / `tracking-*`
 * Tailwind utilities inside JSX `className` attributes. All typography on
 * this surface must flow through `Typography` from `@dooform/ui` (variants,
 * tone, weight, align). Color utilities, font-family utilities (`font-mono`,
 * `font-sans`), text alignment, and arbitrary sizes (`text-[14px]`) are
 * still allowed for non-typographic concerns (icon glyphs, decorative text).
 *
 * The rule targets JSX attribute literals only. If you have a single
 * self-closing element that legitimately needs a size class (input,
 * textarea, button glyph), extract its className to a named module-scope
 * constant and document why — the rule won't flag the constant, and the
 * named indirection makes the carve-out auditable.
 */
const TYPOGRAPHY_BAN_PATTERN =
  '(?:^|\\s)(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)|leading-|tracking-)';

const TYPOGRAPHY_BAN_MESSAGE =
  'Use a Typography variant from @dooform/ui instead of raw text-{size}/font-{weight}/leading-*/tracking-* utilities. See libs/ui/src/components/Typography/Typography.tsx for the full scale.';

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['.next/**/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=/${TYPOGRAPHY_BAN_PATTERN}/]`,
          message: TYPOGRAPHY_BAN_MESSAGE,
        },
        {
          selector: `JSXAttribute[name.name='className'] TemplateElement[value.cooked=/${TYPOGRAPHY_BAN_PATTERN}/]`,
          message: TYPOGRAPHY_BAN_MESSAGE,
        },
      ],
    },
  },
];
