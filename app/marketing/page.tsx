'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function MarketingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

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
        setMessage({ type: 'success', text: data.message });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'There was an error submitting your email. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
        <div className="flex items-center">
          <Home className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        {/* Nav */}
        <nav className="flex gap-4 sm:gap-6 text-sm text-gray-500 font-medium pr-2">
          <Link href="/auth/signin" className="hover:text-gray-700 transition-colors">Login</Link>
        </nav>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-1 flex-col min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-120px)]">
        {/* Hero Section - Upper 1/3 on desktop, more on mobile */}
        <div className="flex flex-col text-left justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 tracking-tighter
                        h-[40vh] sm:h-[35vh] md:h-[33vh] lg:h-[30vh] xl:h-[28vh] 2xl:h-[25vh]">
          <div className="w-full max-w-4xl xl:max-w-6xl 2xl:max-w-7xl text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-black mb-2 sm:mb-3 lg:mb-4 letter leading-tight">
              Keystone
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold text-gray-400 mb-0 leading-tight">
              A new real estate lead platform.
            </h2>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold text-gray-400 mb-4 sm:mb-6 lg:mb-8 leading-tight">
              Built for <span className="text-emerald-700 font-bold">today's market.</span>
            </h3>
          </div>
        </div>

        {/* Image Section - Bottom 2/3 on desktop, less on mobile */}
        <div className="flex-1 flex items-center justify-center lg:justify-end px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16
                        h-[60vh] sm:h-[65vh] md:h-[67vh] lg:h-[70vh] xl:h-[72vh] 2xl:h-[75vh]">
          <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl h-full flex justify-center lg:justify-end">
            <Image 
              src="/background.png" 
              alt="Keystone Platform Preview" 
              width={800} 
              height={600} 
              className="opacity-80 w-full h-full object-contain max-w-[900px] max-h-[900px] 2xl:max-w-[1200px] 2xl:max-h-[1200px]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Next Viewport Height Section */}
      <section className="flex flex-col items-center justify-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 tracking-tighter py-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full flex flex-col items-center text-center gap-6 sm:gap-8 lg:gap-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-black leading-tight">
            Multi-family real estate tech deserves a refresh.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl text-gray-500 font-medium mb-2 sm:mb-4 lg:mb-6 leading-relaxed">
            Say goodbye to manual data entry, tedious spreadsheets, and scattered leads.
          </p>
          
          {/* Message Display */}
          
          {message && (
            <div className={`w-full max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 sm:py-4 lg:py-5 rounded-md text-center text-sm sm:text-base lg:text-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8"
          >

            <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-3 sm:gap-4 lg:gap-6">
                
                
              <Input
                type="email"
                required
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full sm:w-auto max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 sm:py-4 lg:py-5 rounded-md bg-gray-100 border border-gray-200 text-base sm:text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold rounded-md bg-black text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>

          </form>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-xl xl:text-xl text-gray-500 font-medium mb-2 sm:mb-4 lg:mb-6 ">
              Enter your email to get first access
            </h2>
        </div>
      </section>
    </div>
  );
} 