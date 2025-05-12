'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
        },
      });

      setMessage({
        text: 'Profile updated successfully',
        type: 'success',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        text: 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your account settings and profile information
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-md p-4 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Personal Information</h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-5 dark:border-gray-800">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1 block h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1 block h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-red-400 dark:focus:ring-red-400 sm:text-sm"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                    <p className="mt-1 text-sm">{session.user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                    <p className="mt-1 text-sm">{session.user?.email || 'Not set'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="px-6 py-5">
              <h2 className="text-lg font-medium">Account Security</h2>
            </div>
            <div className="border-t border-gray-200 px-6 py-5 dark:border-gray-800">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => window.location.href = '/profile/change-password'}
              >
                Change password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}