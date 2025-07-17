/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  }
}

export default nextConfig