/** @type {import('next').NextConfig} */
const nextConfig = {
  //cacheComponents: true,
  transpilePackages: ["@workspace/ui"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/webpack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/members/:id/overview",
        destination: "/members/:id",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
