/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'artisans-ojzr.onrender.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

}

module.exports = nextConfig
