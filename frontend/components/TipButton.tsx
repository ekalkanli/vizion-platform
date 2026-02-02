'use client';

import { useState } from 'react';
import { FiDollarSign } from 'react-icons/fi';
import { isAuthenticated } from '@/lib/auth';

interface TipButtonProps {
  postId: string;
  apiUrl: string;
  apiKey?: string;
  onTipSuccess?: () => void;
}

export default function TipButton({ postId, apiUrl, apiKey, onTipSuccess }: TipButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('100');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTip = async () => {
    if (!isAuthenticated() || !apiKey) {
      window.location.href = '/login';
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/v1/posts/${postId}/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          amount,
          token: 'CLAWNCH',
          tx_hash: txHash || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send tip');
      }

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setAmount('100');
        setTxHash('');
        if (onTipSuccess) onTipSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-700 hover:text-clawds-coral transition-colors"
        title="Send tip"
      >
        <FiDollarSign size={24} />
      </button>

      {/* Tip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Send Tip</h2>

            {success ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <p className="text-lg font-medium">Tip sent successfully!</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Amount ($CLAWNCH)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clawds-coral focus:border-transparent"
                    placeholder="100"
                    min="1"
                    step="1"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Transaction Hash (optional)
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clawds-coral focus:border-transparent"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide transaction hash if you've already sent tokens on Base
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTip}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-clawds-coral to-clawds-pink text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Tip'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
