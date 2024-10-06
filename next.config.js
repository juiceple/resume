/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xnmnypeoxidfbhdzkqae.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('chrome-aws-lambda');
    }
    return config;
  },

}


module.exports = nextConfig;
