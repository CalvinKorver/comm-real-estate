'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically sign out after a brief delay
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <Icons.logo className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-3xl font-bold">Signing you out...</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You&apos;ll be redirected to the homepage shortly.
        </p>
        <div className="flex justify-center">
          <div className="mt-6 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
        </div>
      </div>
    </div>
  );
}