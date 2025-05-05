'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Authenticate() {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const user = localStorage.getItem('user');
        console.log('Checking for existing user:', user); // Debug log
        
        if (user) {
          console.log('User found, attempting redirect...'); // Debug log
          // Try both methods of redirection
          try {
            router.replace('/dashboard');
          } catch (e) {
            console.log('Router replace failed, trying window.location'); // Debug log
            window.location.href = '/dashboard';
          }
        }
      } catch (error) {
        console.error('Error in checkAndRedirect:', error);
      }
    };

    checkAndRedirect();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store user data in localStorage
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      };
      
      console.log('Storing user data:', userData); // Debug log
      localStorage.setItem('user', JSON.stringify(userData));

      // Save user data to database
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to save user data to database');
        }
      } catch (error) {
        console.error('Error saving user data to database:', error);
        // Continue with the flow even if database save fails
      }
      
      // Try both methods of redirection
      try {
        console.log('Attempting router replace...'); // Debug log
        router.replace('/dashboard');
      } catch (e) {
        console.log('Router replace failed, trying window.location'); // Debug log
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Sign in error:', error); // Debug log
      toast.error(error.message || 'An error occurred during sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
} 