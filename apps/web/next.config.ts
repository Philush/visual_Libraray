import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Разрешаем загрузку изображений обложек книг с внешних источников.
  // При добавлении новых источников в F-11 — дополнять список.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
      },
    ],
  },
};

export default nextConfig;
