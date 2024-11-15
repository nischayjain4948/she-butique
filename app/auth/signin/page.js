'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', { email, password, redirect: false });

    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      setError(null);

      // Get session data to check the role
      const session = await getSession();
      if (session.user.role === 'admin') {
        router.replace('/admin'); // Redirect admin users to admin page
      } else {
        router.replace('/'); // Redirect regular users to home
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password:</label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-blue-500 hover:underline text-sm"
            >
              {isPasswordVisible ? '👁️' :  '🙈' }
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading} // Disable button when loading
              className={`w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mx-auto text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C6.7 0 2 4.7 2 10h2z"
                  ></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <a href="#" className="text-sm text-blue-500 hover:underline">Forgot Password?</a>
        </div>

        <div className="text-center mt-2">
          <Link href="/auth/signup" className="text-sm text-blue-500 hover:underline">
            Don’t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
