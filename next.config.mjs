/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'lib', 'features', 'components'],
  },
};

export default nextConfig;
