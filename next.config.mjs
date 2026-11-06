/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Static export: editing and rendering happen in the browser, so there is
   * nothing to run on the server side. Everything goes to GitHub Pages.
   */
  output: 'export',
  trailingSlash: true,
  experimental: { globalNotFound: true },
  images: {
    /*
     * The next/image optimizer does not work with `output: 'export'`.
     */
    unoptimized: true,
  },
};

export default nextConfig;
