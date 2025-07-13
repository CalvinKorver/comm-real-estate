/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      's3.amazonaws.com',
      'keystone-comm-real-estate.s3.amazonaws.com', // Add your specific S3 bucket domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle telnyx module on server side
      config.externals = config.externals || [];
      config.externals.push('telnyx');
    }
    return config;
  },
}

export default nextConfig
