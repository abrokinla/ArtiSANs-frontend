/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'https://artisans-ojzr.onrender.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

}

module.exports = nextConfig
