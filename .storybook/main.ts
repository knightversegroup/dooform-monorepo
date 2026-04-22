import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../libs/ui/src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          'next/link': resolve(__dirname, 'mocks/next-link.tsx'),
        },
      },
      css: {
        postcss: {
          plugins: [
            tailwindcss({
              content: [resolve(__dirname, '../libs/ui/src/**/*.{ts,tsx}')],
              theme: { extend: {} },
              plugins: [],
            }),
            autoprefixer(),
          ],
        },
      },
    });
  },
};

export default config;
