/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['mock-api-w7qy.onrender.com'],
  },
}

module.exports = nextConfig
