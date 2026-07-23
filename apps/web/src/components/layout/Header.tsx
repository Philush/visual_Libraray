'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-3 shrink-0">
      <Link href="/library" className="flex items-center gap-2 font-semibold text-gray-900">
        <BookOpen className="w-5 h-5 text-amber-600" />
        <span>Visual Library</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>{user.name ?? user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100"
          title="Выйти"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </div>
    </header>
  );
}
