import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 flex items-center gap-2 text-gray-900">
        <BookOpen className="w-6 h-6 text-amber-600" />
        <span className="text-xl font-semibold">Visual Library</span>
      </div>
      {children}
    </div>
  );
}
