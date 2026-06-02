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

const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});
