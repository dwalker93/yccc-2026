/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/webpack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
