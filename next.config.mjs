/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Eksport statyczny: montaz i renderowanie dzieja sie w przegladarce, wiec
   * nie ma czego uruchamiac po stronie serwera. Calosc trafia na GitHub Pages.
   */
  output: 'export',
  trailingSlash: true,
  images: {
    // Pod `output: 'export'` optymalizator next/image nie dziala.
    unoptimized: true,
  },
};

export default nextConfig;
