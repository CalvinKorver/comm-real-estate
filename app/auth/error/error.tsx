'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password.';
      case 'OAuthAccountNotLinked':
        return 'The email on this account is already associated with another provider.';
      case 'EmailSignin':
        return 'There was a problem sending the email. Please try again.';
      case 'SessionRequired':
        return 'You must be signed in to access this page.';
      case 'AccessDenied':
        return 'You do not have permission to access this resource.';
      case 'Default':
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Icons.logo className="mx-auto h-12 w-12" />
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
        
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <Button
            asChild
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Link href="/auth/signin">
              Try signing in again
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/">
              Return to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}