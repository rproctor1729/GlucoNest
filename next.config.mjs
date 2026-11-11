/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // Preview servers must not overwrite the user's running development chunks.
  distDir: process.env.NODE_ENV === 'development'
    ? (process.env.GLUCONEST_PREVIEW === '1' ? '.next-preview' : '.next-dev')
    : '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const development = process.env.NODE_ENV === 'development';
    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "worker-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      ...(development ? [] : ['upgrade-insecure-requests']),
    ].join('; ');

    return [{
      // Static images in /public change rarely; cache them for a week and allow a day of stale-while-revalidate.
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
      ],
    }, {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
