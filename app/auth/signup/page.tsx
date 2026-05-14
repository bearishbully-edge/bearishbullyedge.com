'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-gray-800 border border-green-700 rounded-lg p-8 text-center'>
          <h1 className='text-2xl font-bold text-white mb-2'>Check Your Email</h1>
          <p className='text-gray-400 mb-6'>We sent you a confirmation link.</p>
          <a href='/auth/login' className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg'>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg p-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Create Account</h1>
        <p className='text-gray-400 mb-6'>Start trading with BearishBully Edge</p>

        {error && (
          <div className='mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white'
              required
              minLength={6}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg'
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className='mt-6 text-center text-gray-400'>
          Already have an account? <a href='/auth/login' className='text-blue-400'>Sign in</a>
        </p>
      </div>
    </div>
  );
}