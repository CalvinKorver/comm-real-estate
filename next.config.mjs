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
}

export default nextConfig
