import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MarketingPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-white">
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2">
              <h1 className="text-6xl font-bold text-gray-900">
              
              <span>Pace</span>
              <span className="text-blue-600">Kit 🏃</span>
              </h1>
              <h2 className="mt-6 text-2xl text-gray-600">
                Design your perfect run. <br/> Sync to your watch. <br/> Start moving.
              </h2>
              <div className="mt-8">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="px-4 text-black py-3 rounded-lg border border-gray-300 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg  hover:bg-blue-700"
                  >
                    Join Waitlist
                  </button>
                </form>
                {submitted && (
                  <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>
                      Thanks for signing up! We'll notify you when Run Sync launches.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <div className="lg:w-1/2 mt-8 lg:mt-0 flex items-center justify-center">
              <img
                src="src/assets/screen2.png"
                alt="App Preview"
                className='max-w-xs h-full pr-6'
              />
              <img
                src="src/assets/watch.png"
                alt="App Preview"
                className='max-w-48 h-full pl-6'
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow">
              <h3 className="text-xl text-black font-semibold mb-4">Custom Workouts</h3>
              <p className="text-gray-600">Design structured workouts with warmup, main sets, and cooldown blocks.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow">
              <h3 className="text-xl text-black font-semibold mb-4">Pace Control</h3>
              <p className="text-gray-600">Set target paces for each segment of your run to hit your goals.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow">
              <h3 className="text-xl text-black font-semibold mb-4">Watch Integration</h3>
              <p className="text-gray-600">Seamlessly sync workouts to your Apple Watch and track your progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      {/* <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Simple and Intuitive
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex justify-center">
              <img src="/src/assets/screen1.png" alt="App Screenshot 1" className="max-w-xs " />
            </div>
            <div className="flex justify-center">
              <img src="/api/placeholder/320/640" alt="App Screenshot 2" className="max-w-xs " />
            </div>
            <div className="flex justify-center">
              <img src="/api/placeholder/320/640" alt="App Screenshot 3" className="max-w-xs " />
            </div>
          </div>
        </div>
      </section> */}

      {/* Waitlist Section */}
      {/* <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Be the first to know when we launch
          </h2>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="px-4 py-3 rounded-lg border border-transparent flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100"
              >
                Join Waitlist
              </button>
            </form>
            {submitted && (
              <Alert className="mt-4 bg-blue-500 text-white border-blue-400">
                <AlertDescription>
                  Thanks for signing up! We will notify you when Run Sync launches.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          {/* <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-4">Run Sync</h3>
              <p className="text-gray-400">Design. Sync. Run.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li>Features</li>
                  <li>Updates</li>
                  <li>Support</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>About</li>
                  <li>Blog</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>Privacy</li>
                  <li>Terms</li>
                </ul>
              </div>
            </div>
          </div> */}
          <div className="mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Run Sync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;