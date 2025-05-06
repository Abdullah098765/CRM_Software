'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background-primary">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 