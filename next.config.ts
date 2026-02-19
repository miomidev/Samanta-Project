import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['sequelize', 'sequelize-typescript'],
  // Prevent bundling of unused database drivers
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'pg', 'pg-hstore', 'sqlite3', 'tedious', 'oracledb'];
    return config;
  },
};

export default nextConfig;
