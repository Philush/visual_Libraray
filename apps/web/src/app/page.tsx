import { redirect } from 'next/navigation';

/**
 * Корневая страница — редиректит на /login.
 * После успешной авторизации /login перенаправляет на /library.
 */
export default function RootPage() {
  redirect('/login');
}
