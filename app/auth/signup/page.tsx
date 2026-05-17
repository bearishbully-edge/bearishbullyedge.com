'use client';

import { useState } from 'react';

type WaitlistResponse = {
  ok: boolean;
  error?: string;
  message?: string;
};

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tradingFocus, setTradingFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleWaitlistSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          tradingFocus,
          source: 'bearishbullyedge_signup_page',
        }),
      });

      const data = (await response.json()) as WaitlistResponse;

      if (!response.ok || !data.ok) {
        setError(data.message || data.error || 'Unable to join waitlist.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Unable to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-emerald-500/30 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">✅</div>

          <h1 className="text-3xl font-black mb-3">
            You’re on the early access list.
          </h1>

          <p className="text-slate-300 leading-7">
            BearishBully Edge is currently invitation-only while the terminal is
            being hardened for early members. You’ll be notified when your
            membership window opens.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/"
              className="rounded-xl bg-white px-6 py-3 font-bold text-slate-950 hover:bg-slate-200"
            >
              Back to Home
            </a>

            <a
              href="/auth/login"
              className="rounded-xl border border-slate-700 px-6 py-3 font-bold text-white hover:bg-slate-800"
            >
              Member Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="text-xl font-black tracking-tight">
          BearishBully Edge
        </a>

        <a
          href="/auth/login"
          className="rounded-full border border-slate-700 px-5 py-2 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
        >
          Member Login
        </a>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            Invitation-only early access
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Request early access to BearishBully Edge.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            The terminal is not open to the public yet. We are onboarding a
            limited group of serious traders while the platform is being
            hardened, tested, and refined.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-black">Early members get access to:</h2>

            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Terminal previews and market context tools</li>
              <li>• Bias, volume, orderflow, COT, and economic-event modules</li>
              <li>• Replay/backtest workflow previews</li>
              <li>• Controlled onboarding before public release</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <h2 className="text-2xl font-black mb-2">Join the waitlist</h2>

          <p className="mb-6 text-sm leading-6 text-slate-400">
            Request an invitation. Approved members will be contacted as access
            opens.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleWaitlistSignup} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Trading focus
              </label>
              <select
                value={tradingFocus}
                onChange={(e) => setTradingFocus(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              >
                <option value="">Select one</option>
                <option value="futures">Futures</option>
                <option value="options">Options</option>
                <option value="stocks-etfs">Stocks / ETFs</option>
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
                <option value="multi-asset">Multi-asset</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-400 px-6 py-4 font-black text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loading ? 'Submitting...' : 'Request Invitation'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already approved?{' '}
            <a href="/auth/login" className="font-semibold text-emerald-300">
              Log in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}