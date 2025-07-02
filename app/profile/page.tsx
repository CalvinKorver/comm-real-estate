'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BaseHeader } from '@/components/base-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || ''
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'Failed to update profile'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while updating your profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (status === 'loading') {
    return (
      <>
        <BaseHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-lg">
            <div className="text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <BaseHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-lg">
            <div className="text-center">
              <p className="text-muted-foreground">Please sign in to view your profile.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BaseHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your account settings and profile information
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-md p-4 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}