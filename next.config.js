/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xnmnypeoxidfbhdzkqae.supabase.co'],
  },
  webpack: (config, { isServer, dev }) => {
    if (!dev && isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        if (entries['main.js'] && !entries['main.js'].includes('./serverless-chrome-launcher.js')) {
          entries['main.js'].unshift('./serverless-chrome-launcher.js');
        }
        return entries;
      };
    }
    
    if (isServer) {
      config.externals.push('chrome-aws-lambda');
    }

    return config;
  },
  experimental: {
    outputStandalone: true,
  },
}

module.exports = nextConfig;