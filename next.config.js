/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xnmnypeoxidfbhdzkqae.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들에서 'playwright' 제외
      config.resolve.alias['playwright'] = false;
    }
    return config;
  },

}


module.exports = nextConfig;
