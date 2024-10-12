/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xnmnypeoxidfbhdzkqae.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
    }
    return config;
  },

}


module.exports = nextConfig;
