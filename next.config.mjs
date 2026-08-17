/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zbgzvbcgjvnsgildrmta.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
}

export default nextConfig
