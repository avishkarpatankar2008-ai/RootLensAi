/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // In production (Vercel), the browser calls the backend directly via NEXT_PUBLIC_BACKEND_URL.
  // In local dev you can optionally proxy through Next.js to avoid CORS issues during development.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    return process.env.NODE_ENV === 'development'
      ? [{ source: '/proxy/:path*', destination: `${backendUrl}/:path*` }]
      : [];
  },
};

export default nextConfig;
