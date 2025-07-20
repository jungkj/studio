/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  // Add trailing slash for better static site compatibility
  trailingSlash: true,
  // Disable image optimization for static export
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}

export default nextConfig