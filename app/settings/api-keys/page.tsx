'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

interface APIKey {
  id: number;
  key: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default function APIKeysPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
      loadAPIKeys();
      setLoading(false);
    }
  };

  const loadAPIKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading API keys:', error);
    } else {
      setAPIKeys(data || []);
    }
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    const key = 'bbk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        key: key,
        name: newKeyName,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } else {
      setShowNewKey(key);
      setNewKeyName('');
      loadAPIKeys();
    }
  };

  const toggleAPIKey = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling API key:', error);
    } else {
      loadAPIKeys();
    }
  };

  const deleteAPIKey = async (id: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
    } else {
      loadAPIKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='text-gray-400'>Loading...</div>
      </div>
    );
  }

  return (
    <main className='min-h-screen bg-gray-900'>
      <div className='border-b border-gray-800 bg-gray-900'>
        <div className='max-w-6xl mx-auto px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-white'>API Keys</h1>
              <p className='text-gray-400 text-sm mt-1'>Manage API keys for NinjaTrader integration</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className='px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto p-8'>
        {showNewKey && (
          <div className='bg-green-900/30 border border-green-500 rounded-lg p-6 mb-6'>
            <h3 className='text-green-400 font-bold mb-2'>✅ API Key Created!</h3>
            <p className='text-gray-300 text-sm mb-4'>
              Copy this key now - you won't be able to see it again!
            </p>
            <div className='flex gap-2'>
              <input
                type='text'
                value={showNewKey}
                readOnly
                className='flex-1 bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 font-mono text-sm'
              />
              <button
                onClick={() => copyToClipboard(showNewKey)}
                className='px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition'
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowNewKey(null)}
              className='mt-4 text-sm text-gray-400 hover:text-white'
            >
              I've saved this key
            </button>
          </div>
        )}

        <div className='bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>Create New API Key</h3>
          <div className='flex gap-4'>
            <input
              type='text'
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder='Key name (e.g., "NinjaTrader Desktop")'
              className='flex-1 bg-gray-900 text-white px-4 py-2 rounded border border-gray-700'
            />
            <button
              onClick={generateAPIKey}
              className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
            >
              Generate Key
            </button>
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            Use this key to connect your NinjaTrader indicator
          </p>
        </div>

        <div className='bg-gray-800 border border-gray-700 rounded-lg'>
          <div className='border-b border-gray-700 p-4'>
            <h3 className='text-lg font-semibold text-white'>Your API Keys</h3>
          </div>

          {apiKeys.length === 0 ? (
            <div className='p-12 text-center text-gray-500'>
              <div className='text-4xl mb-3'>🔑</div>
              <p>No API keys yet</p>
              <p className='text-sm'>Create one above to get started</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-700'>
              {apiKeys.map((key) => (
                <div key={key.id} className='p-4 hover:bg-gray-700/30 transition'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h4 className='text-white font-semibold'>{key.name}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            key.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className='text-sm text-gray-400 font-mono mb-2'>
                        {key.key.substring(0, 20)}...{key.key.substring(key.key.length - 10)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Created: {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used_at && (
                          <span className='ml-4'>
                            Last used: {new Date(key.last_used_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => toggleAPIKey(key.id, key.is_active)}
                        className={`px-4 py-2 rounded text-sm transition ${
                          key.is_active
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {key.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteAPIKey(key.id)}
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='bg-blue-900/30 border border-blue-500 rounded-lg p-6 mt-6'>
          <h3 className='text-blue-400 font-bold mb-3'>🔧 NinjaTrader Setup</h3>
          <ol className='space-y-2 text-sm text-gray-300'>
            <li>1. Create an API key above and copy it</li>
            <li>2. In NinjaTrader, add BearishBully Quantum Pro indicator</li>
            <li>3. Set API Endpoint: <code className='bg-gray-800 px-2 py-1 rounded'>http://localhost:3000</code></li>
            <li>4. Paste your API key</li>
            <li>5. Click OK and watch data flow! 🎉</li>
          </ol>
        </div>
      </div>
    </main>
  );
}