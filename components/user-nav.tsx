'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, Settings, Workout, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserNav() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!session) {
    return (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signIn()}
          className="text-sm font-medium"
        >
          Sign in
        </Button>
        <Button
          size="sm"
          onClick={() => window.location.href = '/auth/signup'}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Sign up
        </Button>
      </div>
    );
  }

  const firstName = session.user?.name?.split(' ')[0] || 'User';
  const initials = firstName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {session.user?.name || 'User'}
            </p>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {session.user?.email || ''}
            </p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <Link
            href="/profile"
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <User className="mr-2 h-4 w-4" />
            Your Profile
          </Link>
          <Link
            href="/workouts"
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Workout className="mr-2 h-4 w-4" />
            Your Workouts
          </Link>
          <Link
            href="/workouts/create"
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Workout
          </Link>
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}