'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Add a small delay to ensure localStorage is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;

        const user = localStorage.getItem('user');
        console.log('Auth check - Current path:', pathname); // Debug log
        console.log('Auth check - User data:', user); // Debug log
        
        if (!user) {
          console.log('No user found, redirecting to authenticate'); // Debug log
          if (pathname !== '/authenticate') {
            router.replace('/authenticate');
          }
        } else {
          console.log('User found, allowing access'); // Debug log
          if (pathname === '/authenticate') {
            router.replace('/dashboard');
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (pathname !== '/authenticate') {
          router.replace('/authenticate');
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  // Don't show loading state on authenticate page
  if (isLoading && pathname !== '/authenticate') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 