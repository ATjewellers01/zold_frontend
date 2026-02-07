/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

// Note: For network access and custom port, update package.json scripts instead
// or use: npm run dev -- -H 0.0.0.0 -p 3005
