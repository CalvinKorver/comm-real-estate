"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image'
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from 'next-themes';

const MarketingPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Subscribed successfully');
        setSubmitted(true);
        setEmail('');
      } else {
        if (data.message === 'This email is already subscribed to our newsletter.') {
          console.error('Email already subscribed:', data.message);
          alert('This email is already subscribed to our newsletter.');
        } else {
          console.error('Failed to subscribe:', data.message);
          alert('Failed to subscribe. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error during subscription:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <header className="flex-1 bg-white dark:bg-gray-800">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-16">
          <div className="flex flex-1 flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            {/* Left Column */}
            <div className="flex flex-1 flex-col justify-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
                  <span>Pace</span>
                  <span className="text-blue-600 dark:text-blue-400">Kit 🏃</span>
                </h1>
                <h2 className="text-2xl text-gray-600 dark:text-gray-300">
                  Design your perfect run. <br />
                  Sync to your watch. <br />
                  Start moving.
                </h2>
              </div>
              
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-black 
                             dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700
                             dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Join Waitlist
                  </button>
                </form>
                {submitted && (
                  <Alert className="border-green-200 bg-green-50 text-green-800
                                  dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <AlertDescription>
                      Thanks for signing up! We'll notify you when PaceKit launches.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-1 items-center justify-center space-x-6">
              <Image
                src={theme === 'dark' ? '/screen2-dark.png' : '/screen2.png'}
                alt="App Preview"
                width={280}
                height={640}
                priority
              />
              <Image
                src={theme === 'dark' ? '/watch-dark.png' : '/watch.png'}
                alt="Watch Preview"
                width={192}
                height={384}
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white dark:bg-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2025 Pace Kit. All rights reserved. <a href="/privacy" className="hover:text-gray-300 dark:hover:text-gray-400">Privacy Policy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;