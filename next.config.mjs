/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  // Remove trailing slash for static export
  trailingSlash: false,
  // Ensure proper static file generation
  generateBuildId: async () => {
    return 'build'
  },
}

export default nextConfig