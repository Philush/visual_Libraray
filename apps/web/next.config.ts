import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // standalone — минимальный production-образ для Docker.
  // Копирует только необходимые файлы без лишних node_modules.
  output: 'standalone',
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
