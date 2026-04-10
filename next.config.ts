import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard/items", destination: "/items", permanent: true },
      { source: "/dashboard/items/:path*", destination: "/items/:path*", permanent: true },
      { source: "/dashboard/inventory", destination: "/inventory", permanent: true },
      { source: "/dashboard/inventory/:path*", destination: "/inventory/:path*", permanent: true },
      { source: "/dashboard/orders", destination: "/orders", permanent: true },
      { source: "/dashboard/orders/:path*", destination: "/orders/:path*", permanent: true },
      { source: "/dashboard/shipments", destination: "/shipments", permanent: true },
      { source: "/dashboard/shipments/:path*", destination: "/shipments/:path*", permanent: true },
      { source: "/dashboard/warehouses", destination: "/warehouses", permanent: true },
      { source: "/dashboard/warehouses/:path*", destination: "/warehouses/:path*", permanent: true },
      { source: "/dashboard/users", destination: "/users", permanent: true },
      { source: "/dashboard/users/:path*", destination: "/users/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
