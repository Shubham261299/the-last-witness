const backend = process.env.WITNESS_BACKEND_URL || "http://127.0.0.1:8000";

const config = {
  devIndicators: false,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};
export default config;
