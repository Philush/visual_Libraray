import { redirect } from 'next/navigation';

/**
 * Корневая страница — редиректит на /library.
 * /library — главная точка входа в приложение (список шкафов + книги без полки).
 */
export default function RootPage() {
  redirect('/library');
}
