'use client';

import { useState } from 'react';

const plans = [
  {
    name: 'Edge Starter',
    price: '$97',
    period: '/month',
    features: [
      'Real-time Market Data',
      'Basic Volume Delta',
      'Economic Calendar',
      'Paper Trading Only',
      'Email Support',
      '1 Symbol at a time'
    ],
    buttonText: 'Start Trading',
    highlighted: false
  },
  {
    name: 'Edge Pro',
    price: '$197',
    period: '/month',
    features: [
      'Everything in Starter',
      'Advanced Order Flow',
      'COT Data Analysis',
      'Automated Signals',
      'Live Trading Integration',
      '5 Symbols simultaneously',
      'Priority Support'
    ],
    buttonText: 'Go Pro',
    highlighted: true
  },
  {
    name: 'Edge Institutional',
    price: '$297',
    period: '/month',
    features: [
      'Everything in Pro',
      'Custom Indicators',
      'API Access',
      'Unlimited Symbols',
      'Dedicated Support',
      'Custom Training Session',
      'White-label Options'
    ],
    buttonText: 'Contact Sales',
    highlighted: false
  }
];

const bundles = [
  {
    name: 'Signal Trader',
    price: 449,
    priceId: 'price_1STG3HPXksLWbiDoQcT7DJWv',
    features: [
      'Terminal Elite included',
      'All Markets Signals',
      'NinjaTrader Bridge',
      'Journal Pro',
      'Scanner Pro',
      'Automated trading',
    ],
  },
  {
    name: 'ALL-ACCESS ULTIMATE',
    price: 699,
    priceId: 'price_1STGBfPXksLWbiDoq94vxqhg',
    featured: true,
    features: [
      'Everything in Signal Trader',
      'API Starter (100 req/day)',
      'Copy Trading access',
      '1-on-1 monthly strategy calls',
      'Private community',
      'Early feature access',
    ],
  },
];

const apiPlans = [
  {
    name: 'API Starter',
    price: 99,
    priceId: 'price_1STGH7PXksLWbiDotZO0FjF5',
    features: ['100 requests/day', 'Historical data', 'Personal use only'],
  },
  {
    name: 'API Developer',
    price: 299,
    priceId: 'price_1STGJAPXksLWbiDouJKBBYc6',
    features: ['10,000 requests/day', 'Real-time data', '15-min delayed signals', 'Commercial use'],
  },
  {
    name: 'API Professional',
    price: 999,
    priceId: 'price_1STGQiPXksLWbiDo5ku9VzCn',
    features: ['Unlimited requests', 'Real-time signals', 'Webhook support', 'Priority infrastructure'],
  },
  {
    name: 'API Enterprise',
    price: 2999,
    priceId: 'price_1STGS1PXksLWbiDoa6SoGJQw',
    features: ['Dedicated infrastructure', 'White-label options', 'Custom endpoints', 'SLA guarantees'],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  return (
    <div className='min-h-screen bg-gray-900 p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-white mb-4'>Choose Your Edge</h1>
          <p className='text-xl text-gray-400'>Professional trading tools for serious traders</p>
        </div>

        {/* New Edge Plans */}
        <h2 className='text-3xl font-bold text-white mb-8 text-center'>Terminal Access</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gray-800 border rounded-lg p-8 transition-all duration-300 ${
                plan.highlighted 
                  ? 'border-green-500 transform scale-105 shadow-2xl' 
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              {plan.highlighted && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold'>
                    MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className='text-2xl font-bold text-white mb-2'>{plan.name}</h3>
              <div className='mb-6'>
                <span className='text-5xl font-bold text-white'>{plan.price}</span>
                <span className='text-gray-400 text-lg'>{plan.period}</span>
              </div>

              <ul className='space-y-4 mb-8'>
                {plan.features.map((feature, i) => (
                  <li key={i} className='flex items-start'>
                    <svg 
                      className='w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0' 
                      fill='currentColor' 
                      viewBox='0 0 20 20'
                    >
                      <path 
                        fillRule='evenodd' 
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' 
                        clipRule='evenodd' 
                      />
                    </svg>
                    <span className='text-gray-300'>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.name === 'Edge Institutional') {
                    // Handle contact sales
                    window.location.href = 'mailto:sales@bearishbully.com?subject=Edge Institutional Inquiry';
                  } else {
                    // Handle subscription (you'll need to add priceIds for the new plans)
                    const priceId = plan.name === 'Edge Starter' 
                      ? 'price_starter' 
                      : 'price_pro';
                    handleSubscribe(priceId);
                  }
                }}
                disabled={loading === plan.name}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.highlighted 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {loading === plan.name ? 'Loading...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <h2 className='text-3xl font-bold text-white mb-8 text-center'>Premium Bundles</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto'>
          {bundles.map((bundle) => (
            <div
              key={bundle.name}
              className={`relative bg-gray-800 border ${
                bundle.featured ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'
              } rounded-lg p-8`}
            >
              {bundle.featured && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold'>
                    BEST VALUE
                  </span>
                </div>
              )}

              <h3 className='text-2xl font-bold text-white mb-2'>{bundle.name}</h3>
              <div className='mb-6'>
                <span className='text-5xl font-bold text-white'>${bundle.price}</span>
                <span className='text-gray-400'>/month</span>
              </div>

              <ul className='space-y-4 mb-8'>
                {bundle.features.map((feature, i) => (
                  <li key={i} className='flex items-start'>
                    <svg className='w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                    </svg>
                    <span className='text-gray-300'>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(bundle.priceId)}
                disabled={loading === bundle.priceId}
                className='w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition'
              >
                {loading === bundle.priceId ? 'Loading...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        <h2 className='text-3xl font-bold text-white mb-8 text-center'>API Access</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          {apiPlans.map((plan) => (
            <div key={plan.name} className='bg-gray-800 border border-gray-700 rounded-lg p-6'>
              <h3 className='text-xl font-bold text-white mb-2'>{plan.name}</h3>
              <div className='mb-6'>
                <span className='text-3xl font-bold text-white'>${plan.price}</span>
                <span className='text-gray-400 text-sm'>/month</span>
              </div>

              <ul className='space-y-3 mb-6'>
                {plan.features.map((feature, i) => (
                  <li key={i} className='text-sm text-gray-300'>{feature}</li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loading === plan.priceId}
                className='w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition'
              >
                {loading === plan.priceId ? 'Loading...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        <div className='bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-500 rounded-lg p-8 text-center mb-16'>
          <h2 className='text-3xl font-bold text-white mb-4'>Enterprise Signal Feed</h2>
          <p className='text-xl text-gray-300 mb-2'>$9,999/month</p>
          <p className='text-gray-400 mb-6'>
            Institutional-grade signal feed licensed for managing client capital
          </p>
          <button
            onClick={() => handleSubscribe('price_1STGX6PXksLWbiDomiQM7REn')}
            disabled={loading === 'price_1STGX6PXksLWbiDomiQM7REn'}
            className='px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition'
          >
            {loading === 'price_1STGX6PXksLWbiDomiQM7REn' ? 'Loading...' : 'Contact Sales'}
          </button>
        </div>

        <div className='text-center'>
          <p className='text-gray-400 mb-4'>All plans include 7-day free trial</p>
          <a href='/dashboard' className='text-blue-400 hover:text-blue-300'>← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}