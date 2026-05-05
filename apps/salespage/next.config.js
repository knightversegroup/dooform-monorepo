//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

const API_TARGET =
  process.env.DOOFORM_API_URL ||
  process.env.NEXT_PUBLIC_DOOFORM_API_URL ||
  'http://localhost:3000/api';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  // Proxy public dooform-api endpoints through this app's origin so the browser
  // never makes a cross-origin call (no CORS preflight). Server-side calls go
  // direct via the absolute URL in `lib/dooform-api.ts`.
  async rewrites() {
    return [
      {
        source: '/api/dooform/:path*',
        destination: `${API_TARGET}/:path*`,
      },
    ];
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
