/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    MNQ_DEFAULT_SYMBOL: process.env.MNQ_DEFAULT_SYMBOL || 'MNQ',
  },
}

module.exports = nextConfig
